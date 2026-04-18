import { Suspense } from "react"
import { DataTableSkeleton } from "../../../../components/shared/data-table-skeleton"
import { DataTable } from "../../../../components/procurement/suppliers/data-table"
import { columns, Supplier } from "../../../../components/procurement/suppliers/columns"
import { SupplierFormSheet } from "../../../../components/procurement/suppliers/supplier-form-sheet"

// Simulate an API call, we will make this server component fetch the actual API in a real scenario
// or we can just render the client component which fetches the data
import { cookies } from "next/headers"

async function getSuppliers(): Promise<Supplier[]> {
  const cookieStore = await cookies()
  const channelId = cookieStore.get("channel-id")?.value

  if (!channelId) {
    return []
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/suppliers`, {
      cache: "no-store",
      headers: {
        "x-channel-id": channelId,
      },
    })
    if (!res.ok) {
      return []
    }
    const data = await res.json()
    return data
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return []
  }
}

export default async function SuppliersPage() {
  const data = await getSuppliers()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tedarikçiler</h2>
        <div className="flex items-center space-x-2">
          <SupplierFormSheet />
        </div>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <Suspense fallback={<DataTableSkeleton />}>
          <DataTable columns={columns} data={data} />
        </Suspense>
      </div>
    </div>
  )
}
