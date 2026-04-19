export const dynamic = 'force-dynamic';
import React, { Suspense } from "react"
import { DataTable } from "../../../components/products/data-table"
import { columns, Product } from "../../../components/products/columns"
import { DataTableSkeleton } from "../../../components/products/data-table-skeleton"
import { ProductDetailSheet } from "../../../components/products/product-detail-sheet"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

async function getProducts(channelId: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products?channelId=${channelId}`, {
      cache: 'no-store', // Always fetch fresh data since we are bypassing complex caching for now
      headers: {
        'x-channel-id': channelId,
      }
    });

    if (!res.ok) {
      console.error("Failed to fetch products:", res.status);
      return [];
    }

    const json = await res.json();

    // Transform backend data to frontend Product interface expected by columns.tsx
    // The backend returns an array in data and meta information.
    // Ensure we handle the mapping properly.
    if (!json.data || !Array.isArray(json.data)) return [];

    return json.data.map((p: any) => {
      // Find the main variant or the first one
      const variant = p.variants && p.variants.length > 0 ? p.variants[0] : null;

      const price = variant ? parseFloat(variant.price) : 0;
      const cost = variant ? parseFloat(variant.movingAverageCost || p.costPrice || 0) : 0;
      const margin = cost > 0 ? ((price - cost) / cost) * 100 : 100;
      const stock = variant ? variant.stock : 0;

      return {
        id: p.id,
        name: p.name,
        sku: variant ? variant.sku : 'N/A',
        price,
        cost,
        margin,
        stock,
        status: stock > 0 ? "IN_STOCK" : "OUT_OF_STOCK", // Simplified
        imageUrl: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=100&q=80", // Placeholder
        channels: [p.channelId], // It's isolated by channel due to RLS
        // subRows: p.variants.map(...) could be added here if handling variations
      } as Product;
    });

  } catch(error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

function ProductsPageContent({ products }: { products: Product[] }) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6 bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-slate-800">Ürünler</h2>
      </div>
      <DataTable columns={columns} data={products} />
      <ProductDetailSheet />
    </div>
  )
}

async function ProductsPage({ searchParams }: { searchParams: Promise<{ channelId?: string }> }) {
  const { channelId = 'trendyol' } = await searchParams;
  const products = await getProducts(channelId)

  return (
    <Suspense fallback={<div className="p-4 md:p-6 pt-6 bg-slate-50 min-h-[calc(100vh-64px)]"><DataTableSkeleton /></div>} key={channelId}>
      <ProductsPageContent products={products} />
    </Suspense>
  )
}

export default function ProductsPageWrapper({ searchParams }: { searchParams: Promise<{ channelId?: string }> }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPage searchParams={searchParams} />
    </Suspense>
  )
}