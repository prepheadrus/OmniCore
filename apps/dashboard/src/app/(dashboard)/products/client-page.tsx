"use client"

import React from "react"
import { DataTable } from "../../../components/products/data-table"
import { columns, Product } from "../../../components/products/columns"
import { ProductDetailSheet } from "../../../components/products/product-detail-sheet"

export function ProductsClientPage({ products }: { products: Product[] }) {
  const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6 bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-slate-800">Ürünler</h2>
      </div>
      <DataTable columns={columns} data={products} onOpenProductDetail={setSelectedProductId} />
      <ProductDetailSheet productId={selectedProductId} onClose={() => setSelectedProductId(null)} />
    </div>
  )
}
