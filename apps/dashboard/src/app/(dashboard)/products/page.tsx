import React, { Suspense } from 'react';
import { ProductsPageContent } from './ProductsPageContent';
import { DataTableSkeleton } from '../../../components/products/data-table-skeleton';

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Ürünler
        </h1>
        <p className="text-slate-500 mt-1.5 font-medium">
          Tüm ürün kataloğunuzu, stok ve fiyatları yönetin.
        </p>
      </div>

      <Suspense fallback={<DataTableSkeleton />}>
        <ProductsPageContent />
      </Suspense>
    </div>
  );
}
