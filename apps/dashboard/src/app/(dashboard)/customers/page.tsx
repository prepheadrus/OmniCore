import React from 'react';
import { CustomersList } from '../../../components/customers/CustomersList';

export default function CustomersPage() {
  return (
    <div className="flex-1 space-y-4 pt-2">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Müşteriler</h2>
          <p className="text-[13px] text-slate-500">Tüm pazar yerlerinden gelen müşteri verilerinizi ve sadakat analizlerini yönetin.</p>
        </div>
      </div>
      <CustomersList />
    </div>
  );
}
