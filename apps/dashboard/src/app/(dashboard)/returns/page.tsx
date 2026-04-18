"use client";

import React, { useState, useEffect } from 'react';
import { columns } from '../../../components/returns/columns';
import { DataTable } from '../../../components/returns/data-table';
import { DataTableSkeleton } from '../../../components/shared/data-table-skeleton';
import { mockReturns, ReturnOrder } from '../../../components/returns/mock-data';

export default function ReturnsPage() {
  const [data, setData] = useState<ReturnOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    // Simulate 1000ms delay for fetching data
    const timer = setTimeout(() => {
      setData(mockReturns);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          İade Yönetimi (Reverse Logistics)
        </h1>
        <p className="text-slate-500 mt-1.5 font-medium">
          Müşteri iade taleplerini, kargo durumlarını ve depo giriş süreçlerini yönetin.
        </p>
      </div>

      {isLoading ? (
        <DataTableSkeleton />
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
}
