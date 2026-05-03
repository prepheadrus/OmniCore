import React from 'react';
import { ReportsDashboard } from '../../../components/reports/ReportsDashboard';

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-4 pt-2">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Raporlar & Analiz</h2>
          <p className="text-[13px] text-slate-500">Satış, kârlılık ve operasyonel verilerinizi tek merkezden detaylı olarak inceleyin.</p>
        </div>
      </div>
      <ReportsDashboard />
    </div>
  );
}
