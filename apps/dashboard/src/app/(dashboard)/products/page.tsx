import React, { Suspense } from "react"
import { Product } from "../../../components/products/columns"
import { DataTableSkeleton } from "../../../components/products/data-table-skeleton"
import { ProductsClientPage } from "./client-page"
import { env } from "process"
import { cookies } from "next/headers"

async function getProducts(searchParams?: { [key: string]: string | string[] | undefined }): Promise<Product[]> {
  const query = new URLSearchParams()
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        query.append(key, value.toString())
      }
    })
  }

  const apiUrl = env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
  try {
    const cookieStore = await cookies();
    const channelId = cookieStore.get('channel-id')?.value || 'trendyol';
    const res = await fetch(`${apiUrl}/products?${query.toString()}`, {
      cache: 'no-store',
      headers: {
        Cookie: cookieStore.toString(),
        'x-channel-id': channelId,
      },
    })
    if (!res.ok) {
      console.error('Failed to fetch products', res.statusText)
      return []
    }
    const data = await res.json()
    // Map backend data to Product interface
    return data.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      price: Number(item.price),
      cost: Number(item.cost),
      margin: item.cost > 0 ? ((Number(item.price) - Number(item.cost)) / Number(item.cost)) * 100 : 100,
      stock: item.stock,
      status: item.isActive ? (item.stock > 0 ? "IN_STOCK" : "OUT_OF_STOCK") : "INACTIVE",
      imageUrl: item.images?.[0] || undefined,
      category: item.category?.name || "Kategorisiz",
      brand: item.brand?.name || "Markasız",
      channels: item.listings ? Object.keys(item.listings) : [],
    }))
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function ProductsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const products = await getProducts(searchParams)

  return (
    <Suspense fallback={<div className="p-4 md:p-6 pt-6 bg-slate-50 min-h-[calc(100vh-64px)]"><DataTableSkeleton /></div>}>
      <ProductsClientPage products={products} />
    </Suspense>
  )
}
