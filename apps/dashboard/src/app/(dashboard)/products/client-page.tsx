"use client"

import React from "react"
import Link from "next/link"
import { DataTable } from "../../../components/products/data-table"
import { columns, Product } from "../../../components/products/columns"
import { Button } from "@omnicore/ui/components/ui/button"
import { Plus } from "lucide-react"
import { ProductDetailSheet } from "../../../components/products/product-detail-sheet"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export function ProductsClientPage({ products }: { products: Product[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)
  const productId = searchParams?.get('productId')

  useEffect(() => {
    if (productId) {
      setSheetOpen(true)
    } else {
      setSheetOpen(false)
    }
  }, [productId])

  const closeSheet = () => {
    setSheetOpen(false)
    // small delay to allow animation
    setTimeout(() => {
        router.replace('?', { scroll: false })
    }, 300)
  }

  const selectedProduct = productId ? products.find(p => p.id === productId) : undefined

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6 bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-[1.5rem] font-medium tracking-tight text-slate-800 tracking-[-0.02em] pt-4">Ürünler</h2>
        <div className="flex items-center space-x-2">
          <Link href="/products/new">
            <Button className="bg-slate-900 hover:bg-slate-800 text-slate-50 h-8 px-4 rounded-md text-[13px] transition-colors shadow-none">
              <Plus className="mr-2 h-4 w-4" /> Yeni Ürün
            </Button>
          </Link>
        </div>
      </div>
      <DataTable columns={columns} data={products} />
      <ProductDetailSheet
        productId={productId}
        onClose={closeSheet}
      />
    </div>
  )
}
