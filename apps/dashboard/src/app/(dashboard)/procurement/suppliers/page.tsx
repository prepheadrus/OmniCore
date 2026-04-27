export const dynamic = "force-dynamic";
import { Suspense } from "react"
import { DataTableSkeleton } from "../../../../components/shared/data-table-skeleton"
import { DataTable } from "../../../../components/procurement/suppliers/data-table"
import { columns, Supplier } from "../../../../components/procurement/suppliers/columns"

async function getSuppliers(searchParams: { [key: string]: string | string[] | undefined }): Promise<Supplier[]> {
  const queryParams = new URLSearchParams();
  if (typeof searchParams?.search === 'string') {
    queryParams.set('search', searchParams.search);
  }
  if (typeof searchParams?.isActive === 'string') {
    queryParams.set('isActive', searchParams.isActive);
  }
  if (typeof searchParams?.isDropshipper === 'string') {
    queryParams.set('isDropshipper', searchParams.isDropshipper);
  }

  const queryString = queryParams.toString();
  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/suppliers${queryString ? `?${queryString}` : ''}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
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

export default async function SuppliersPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams || {};
  const data = await getSuppliers(searchParams)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <Suspense fallback={<DataTableSkeleton />}>
          <DataTable columns={columns} data={data} />
        </Suspense>
      </div>
    </div>
  )
}
