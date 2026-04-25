'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/store/useAppStore';
import { ScrollText, Search, User, Activity, Clock } from 'lucide-react';

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

export default function AuditLog() {
  const { sidebarOpen } = useAppStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/audit')
      .then((r) => r.json())
      .then((d) => setLogs(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l) =>
    search
      ? l.userName.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.details.toLowerCase().includes(search.toLowerCase())
      : true
  );

  if (loading) {
    return (
      <div
        className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}
      >
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Log &amp; Izleme</h1>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 bg-slate-200 rounded"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}
    >
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Log &amp; Izleme Sistemi</h1>

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
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {new Set(logs.map((l) => l.userName)).size}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">Son Aktivite</p>
            <p className="text-lg font-bold text-slate-900 mt-1">
              {logs.length > 0
                ? new Date(logs[0].createdAt).toLocaleString('tr-TR')
                : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Log ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
        </CardContent>
      </Card>

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
                  <tr
                    key={l.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {new Date(l.createdAt).toLocaleString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {l.userName}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={`${actionColors[l.action] || 'bg-slate-100 text-slate-700'} text-xs`}
                      >
                        {l.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {l.entity}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {l.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
