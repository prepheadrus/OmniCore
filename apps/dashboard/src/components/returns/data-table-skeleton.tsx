"use client";

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
    <div className="w-full space-y-4">
      {/* Header section with search and filter */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>

      <div className="rounded-md border border-slate-200">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead><Skeleton className="h-4 w-32" /></TableHead>
              <TableHead><Skeleton className="h-4 w-40" /></TableHead>
              <TableHead><Skeleton className="h-4 w-20" /></TableHead>
              <TableHead><Skeleton className="h-4 w-24" /></TableHead>
              <TableHead><div className="flex justify-end"><Skeleton className="h-4 w-20" /></div></TableHead>
              <TableHead><div className="flex justify-end"><Skeleton className="h-4 w-8" /></div></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-slate-50/50">
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                <TableCell><div className="flex justify-end"><Skeleton className="h-4 w-20" /></div></TableCell>
                <TableCell><div className="flex justify-end"><Skeleton className="h-8 w-8 rounded-full" /></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination section */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1">
           <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-x-2 flex">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}
