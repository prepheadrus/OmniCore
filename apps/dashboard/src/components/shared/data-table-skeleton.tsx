import { Skeleton } from "@omnicore/ui/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@omnicore/ui/components/ui/table"

export function DataTableSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Skeleton className="h-10 w-full max-w-sm rounded-md" />
          <Skeleton className="h-10 w-[100px] rounded-md" />
        </div>
        <Skeleton className="h-10 w-[100px] rounded-md ml-auto" />
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[40px]"><Skeleton className="h-4 w-4 rounded" /></TableHead>
              <TableHead className="w-[60px]"></TableHead>
              <TableHead><Skeleton className="h-4 w-[150px] rounded" /></TableHead>
              <TableHead><Skeleton className="h-4 w-[100px] rounded" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-4 w-[80px] rounded ml-auto" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-4 w-[60px] rounded ml-auto" /></TableHead>
              <TableHead><Skeleton className="h-4 w-[80px] rounded" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
                <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[200px] rounded" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px] rounded" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-[80px] rounded ml-auto" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-[60px] rounded ml-auto" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <Skeleton className="h-4 w-[150px] rounded" />
        <div className="space-x-2 flex">
          <Skeleton className="h-9 w-[80px] rounded-md" />
          <Skeleton className="h-9 w-[80px] rounded-md" />
        </div>
      </div>
    </div>
  )
}
