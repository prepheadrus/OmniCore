import React, { Suspense } from "react"
import { DataTable } from "../../../components/products/data-table"
import { columns, Product } from "../../../components/products/columns"
import { DataTableSkeleton } from "../../../components/products/data-table-skeleton"
import { ProductDetailSheet } from "../../../components/products/product-detail-sheet"

// Mock Data Generator
async function getProducts(): Promise<Product[]> {
  // Simulate 1.5s network delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return [
    {
      id: "PROD-001",
      name: "Profesyonel Oto Yıkama Şampuanı",
      sku: "PAK-SHMP-01",
      price: 245.0,
      cost: 122.5,
      margin: 100,
      stock: 150,
      status: "IN_STOCK",
      imageUrl: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=100&q=80",
      channels: ["trendyol", "hepsiburada"],
      subRows: [
        {
          id: "PROD-001-V1",
          name: "1 Litre",
          sku: "PAK-SHMP-01-1L",
          price: 245.0,
          cost: 122.5,
          margin: 100,
          stock: 100,
          status: "IN_STOCK",
          channels: ["trendyol"],
        },
        {
          id: "PROD-001-V2",
          name: "5 Litre",
          sku: "PAK-SHMP-01-5L",
          price: 850.0,
          cost: 400.0,
          margin: 112.5,
          stock: 50,
          status: "IN_STOCK",
          channels: ["trendyol", "hepsiburada"],
        },
      ],
    },
    {
      id: "PROD-002",
      name: "Seramik Kaplama Kiti",
      sku: "PAK-CRM-01",
      price: 1200.0,
      cost: 800.0,
      margin: 50,
      stock: 0,
      status: "OUT_OF_STOCK",
      channels: ["amazon"],
    },
    {
      id: "PROD-003",
      name: "5'li Fırça Seti",
      sku: "PAK-BRSH-SET",
      price: 166.0,
      cost: 83.0,
      margin: 100,
      stock: 35,
      status: "IN_STOCK",
      imageUrl: "https://images.unsplash.com/photo-1595152452543-e5fc28ebc2b8?w=100&q=80",
      channels: ["trendyol", "hepsiburada", "amazon"],
    },
    {
      id: "PROD-004",
      name: "Lastik Parlatıcı Sprey",
      sku: "PAK-TIRE-01",
      price: 190.0,
      cost: 195.0,
      margin: -2.5, // Zarar
      stock: 200,
      status: "IN_STOCK",
      channels: ["trendyol"],
    },
    {
      id: "PROD-005",
      name: "Deri Koltuk Temizleyici",
      sku: "PAK-LTHR-01",
      price: 150.0,
      cost: 60.0,
      margin: 150,
      stock: 0,
      status: "INACTIVE",
      channels: [],
    },
  ]
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

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <Suspense fallback={<div className="p-4 md:p-6 pt-6 bg-slate-50 min-h-[calc(100vh-64px)]"><DataTableSkeleton /></div>}>
      <ProductsPageContent products={products} />
    </Suspense>
  )
}
