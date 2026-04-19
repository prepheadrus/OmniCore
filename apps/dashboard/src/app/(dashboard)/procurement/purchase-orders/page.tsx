import { Suspense } from "react"
import { DataTableSkeleton } from "../../../../components/shared/data-table-skeleton"
import { DataTable } from "../../../../components/procurement/purchase-orders/data-table"
import { columns, PurchaseOrder } from "../../../../components/procurement/purchase-orders/columns"
import { PurchaseOrderFormSheet } from "../../../../components/procurement/purchase-orders/purchase-order-form-sheet"

// Simulate an API call, we will make this server component fetch the actual API in a real scenario
// or we can just render the client component which fetches the data
import { cookies } from "next/headers"

async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  const cookieStore = await cookies()
  const channelId = cookieStore.get("channel-id")?.value

  if (!channelId) {
    return []
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/purchase-orders`, {
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
    console.error("Error fetching purchase orders:", error)
    return []
  }
}

async function PurchaseOrdersContent() {
  const data = await getPurchaseOrders()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Alım Faturaları</h2>
        <div className="flex items-center space-x-2">
          <PurchaseOrderFormSheet />
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

export default function PurchaseOrdersPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 pt-6">Yükleniyor...</div>}>
      <PurchaseOrdersContent />
    </Suspense>
  )
}
