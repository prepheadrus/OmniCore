"use client"

import React from "react"
import Link from "next/link"
import { DataTable } from "../../../components/products/data-table"
import { columns, Product } from "../../../components/products/columns"
import { Button } from "@omnicore/ui/components/ui/button"
import { Plus } from "lucide-react"

export function ProductsClientPage({ products }: { products: Product[] }) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6 bg-[#f7f9fb] min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-[1.5rem] font-medium tracking-tight text-[#191c1e] tracking-[-0.02em] pt-4">Ürünler</h2>
        <div className="flex items-center space-x-2">
          <Link href="/products/new">
            <Button className="bg-[#000000] hover:bg-[#333b50] text-[#dae2fd] h-8 px-4 rounded-md text-[13px] transition-colors">
              <Plus className="mr-2 h-4 w-4" /> Yeni Ürün
            </Button>
          </Link>
        </div>
      </div>
      <DataTable columns={columns} data={products} />
    </div>
  )
}
