'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppStore } from '@/store/useAppStore';
import { ScrollText, Search, User, Activity, Clock, Download, FileSpreadsheet, Printer, RefreshCw, Filter, Trash2 } from 'lucide-react';

interface LogEntry {
  id: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
}

const actionColors: Record<string, string> = {
  login: 'bg-blue-100 text-blue-800',
  create: 'bg-emerald-100 text-emerald-800',
  update: 'bg-amber-100 text-amber-800',
  delete: 'bg-red-100 text-red-800',
};

function exportToCSV(data: LogEntry[], filename: string) {
  const headers = ['Tarih', 'Kullanici', 'Islem', 'Varlik', 'Detay'];
  const rows = data.map(l => [l.createdAt, l.userName, l.action, l.entity, l.details]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AuditLog() {
  const { sidebarOpen } = useAppStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch('/api/audit')
      .then((r) => r.json())
      .then((d) => setLogs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = logs.filter((l) =>
    search
      ? l.userName.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.details.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const handleClearLogs = () => {
    setLogs([]);
    setShowClearConfirm(false);
  };

  const handleExportCSV = () => exportToCSV(filtered, 'log-kayitlari.csv');
  const handleExportExcel = () => exportToCSV(filtered, 'log-kayitlari.xlsx');

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Log & Izleme</h1>
        <div className="animate-pulse space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="h-12 bg-slate-200 rounded" />))}</div>
      </div>
    );
  }

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Log & Izleme Sistemi</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Log</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{logs.length}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500">
                <Activity className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Aktif Kullanici</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{new Set(logs.map((l) => l.userName)).size}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Son Aktivite</p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {logs.length > 0 ? new Date(logs[0].createdAt).toLocaleString('tr-TR') : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button size="sm" variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-1" /> Disa Aktar</Button>
        <Button size="sm" variant="outline" onClick={handleExportExcel}><FileSpreadsheet className="h-4 w-4 mr-1" /> Excel Indir</Button>
        <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Yazdir</Button>
        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setShowClearConfirm(true)}><Trash2 className="h-4 w-4 mr-1" /> Temizle</Button>
        <Button size="sm" variant="outline" onClick={() => setShowFilter(!showFilter)}><Filter className="h-4 w-4 mr-1" /> Filtrele</Button>
        <Button size="sm" variant="outline" onClick={fetchData}><RefreshCw className="h-4 w-4 mr-1" /> Yenile</Button>
      </div>

      {showFilter && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Log ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Tarih</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Kullanici</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Islem</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Varlik</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Detay</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500 text-xs">{new Date(l.createdAt).toLocaleString('tr-TR')}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{l.userName}</td>
                    <td className="py-3 px-4"><Badge className={`${actionColors[l.action] || 'bg-slate-100 text-slate-700'} text-xs`}>{l.action}</Badge></td>
                    <td className="py-3 px-4 text-slate-600">{l.entity}</td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Clear Logs Confirmation */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Loglari Temizle</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Tum log kayitlarini silmek istediginize emin misiniz? Bu islem geri alinamaz.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>Iptal</Button>
            <Button variant="destructive" onClick={handleClearLogs}>Temizle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
