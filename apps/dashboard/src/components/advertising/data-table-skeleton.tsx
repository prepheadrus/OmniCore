import { Skeleton } from "@omnicore/ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@omnicore/ui/components/ui/table";

export function DataTableSkeleton() {
  return (
    <div className="w-full h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between p-4 pb-0">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="rounded-md border border-slate-200 mx-4 flex-1">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px]"><Skeleton className="h-4 w-4" /></TableHead>
              <TableHead><Skeleton className="h-4 w-[150px]" /></TableHead>
              <TableHead><Skeleton className="h-4 w-[80px]" /></TableHead>
              <TableHead><Skeleton className="h-4 w-[80px]" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-4 w-[120px] ml-auto" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-4 w-[60px] ml-auto" /></TableHead>
              <TableHead className="text-right"><Skeleton className="h-4 w-[100px] ml-auto" /></TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-5 w-[60px] rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[80px] rounded-full" /></TableCell>
                <TableCell className="text-right">
                  <div className="space-y-2 flex flex-col items-end">
                    <Skeleton className="h-4 w-[120px]" />
                    <Skeleton className="h-1.5 w-[120px] rounded-full" />
                  </div>
                </TableCell>
                <TableCell className="text-right"><Skeleton className="h-4 w-[40px] ml-auto" /></TableCell>
                <TableCell className="text-right">
                  <div className="space-y-2 flex flex-col items-end">
                    <Skeleton className="h-3 w-[60px]" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-8 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 p-4 pt-0">
        <Skeleton className="h-8 w-[80px]" />
        <Skeleton className="h-8 w-[80px]" />
      </div>
    </div>
  );
}
