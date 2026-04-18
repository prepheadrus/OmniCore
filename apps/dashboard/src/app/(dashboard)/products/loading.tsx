import { DataTableSkeleton } from "../../../components/products/data-table-skeleton"

export default function Loading() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 pt-6 bg-slate-50 min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-800">Ürünler</h2>
      </div>
      <DataTableSkeleton />
    </div>
  )
}
