'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Mail,
  Send,
  MousePointerClick,
  Eye,
  AlertCircle,
  Plus,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Filter,
} from 'lucide-react';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  segment: string;
  status: 'draft' | 'scheduled' | 'sent';
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  date: string;
}

interface PerformanceData {
  date: string;
  acilma: number;
  tiklama: number;
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  draft: { label: 'Taslak', cls: 'bg-slate-100 text-slate-600' },
  scheduled: { label: 'Planlanmış', cls: 'bg-blue-100 text-blue-700' },
  sent: { label: 'Gönderildi', cls: 'bg-emerald-100 text-emerald-700' },
};

const segmentLabels: Record<string, string> = {
  all: 'Tüm Müşteriler',
  new: 'Yeni Müşteriler',
  returning: 'Geri Dönen Müşteriler',
  vip: 'VIP Müşteriler',
};

const demoCampaigns: EmailCampaign[] = [
  { id: '1', name: 'Yılbaşı İndirimi', subject: 'Yeni Yıla Özel %30 İndirim!', segment: 'all', status: 'sent', sent: 12500, opened: 3750, clicked: 938, bounced: 125, date: '2024-12-31' },
  { id: '2', name: 'Yeni Ürün Lansmanı', subject: 'Yeni Kablosuz Kulaklık Tanıtımı', segment: 'returning', status: 'sent', sent: 8200, opened: 2870, clicked: 718, bounced: 82, date: '2025-01-05' },
  { id: '3', name: 'VIP Özel Kampanya', subject: 'Sadece Sizin İçin Özel Fırsatlar', segment: 'vip', status: 'sent', sent: 1500, opened: 825, clicked: 338, bounced: 8, date: '2025-01-08' },
  { id: '4', name: 'Kış Sezonu İndirimi', subject: 'Kış Sezonunda Büyük Fırsatlar', segment: 'all', status: 'sent', sent: 15000, opened: 4200, clicked: 1050, bounced: 180, date: '2025-01-10' },
  { id: '5', name: 'Hoş Geldin Kampanyası', subject: 'İlk Alışverişinize %15 İndirim', segment: 'new', status: 'scheduled', sent: 0, opened: 0, clicked: 0, bounced: 0, date: '2025-01-20' },
  { id: '6', name: 'Haftalık Bülten', subject: 'Bu Haftanın En Çok Satanları', segment: 'returning', status: 'draft', sent: 0, opened: 0, clicked: 0, bounced: 0, date: '2025-01-18' },
  { id: '7', name: 'Stok Azaldı Uyarısı', subject: 'Favori Ürününüz Tükenmek Üzere!', segment: 'returning', status: 'sent', sent: 6300, opened: 1890, clicked: 567, bounced: 63, date: '2025-01-12' },
  { id: '8', name: 'Üye Ol Teşviki', subject: 'Üye Olun 500 TL Kazanın', segment: 'new', status: 'draft', sent: 0, opened: 0, clicked: 0, bounced: 0, date: '2025-01-25' },
];

const demoPerformance: PerformanceData[] = [
  { date: '01 Oca', acilma: 750, tiklama: 150 },
  { date: '03 Oca', acilma: 1200, tiklama: 280 },
  { date: '05 Oca', acilma: 950, tiklama: 210 },
  { date: '08 Oca', acilma: 1800, tiklama: 420 },
  { date: '10 Oca', acilma: 2100, tiklama: 530 },
  { date: '12 Oca', acilma: 1600, tiklama: 380 },
  { date: '15 Oca', acilma: 2400, tiklama: 600 },
];

export default function EmailCampaigns() {
  const { sidebarOpen } = useAppStore();
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formSegment, setFormSegment] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetch('/api/email-campaigns')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.campaigns) && data.campaigns.length > 0) {
          setCampaigns(data.campaigns);
        } else {
          setCampaigns(demoCampaigns);
        }
        if (Array.isArray(data?.performance) && data.performance.length > 0) {
          setPerformance(data.performance);
        } else {
          setPerformance(demoPerformance);
        }
      })
      .catch(() => {
        setCampaigns(demoCampaigns);
        setPerformance(demoPerformance);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = () => {
    const payload = {
      name: formName,
      subject: formSubject,
      body: formBody,
      segment: formSegment,
    };

    fetch('/api/email-campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.campaign) {
          setCampaigns((prev) => [data.campaign, ...prev]);
        }
        setDialogOpen(false);
        resetForm();
      })
      .catch(() => {
        const newCampaign: EmailCampaign = {
          id: Date.now().toString(),
          name: formName,
          subject: formSubject,
          segment: formSegment,
          status: 'draft',
          sent: 0, opened: 0, clicked: 0, bounced: 0,
          date: new Date().toISOString().split('T')[0],
        };
        setCampaigns((prev) => [newCampaign, ...prev]);
        setDialogOpen(false);
        resetForm();
      });
  };

  const resetForm = () => {
    setFormName('');
    setFormSubject('');
    setFormBody('');
    setFormSegment('all');
  };

  const filtered = filterStatus === 'all' ? campaigns : campaigns.filter((c) => c.status === filterStatus);

  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalOpened = campaigns.reduce((s, c) => s + c.opened, 0);
  const totalClicked = campaigns.reduce((s, c) => s + c.clicked, 0);
  const totalBounced = campaigns.reduce((s, c) => s + c.bounced, 0);
  const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';
  const avgClickRate = totalOpened > 0 ? ((totalClicked / totalOpened) * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-2 text-2xl font-bold text-slate-800">E-posta Kampanyaları</h1>
        <p className="mb-6 text-slate-500">E-posta pazarlama kampanyaları</p>
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">E-posta Kampanyaları</h1>
        <p className="text-slate-500 mt-1">E-posta pazarlama kampanyalarınızı oluşturun, takip edin ve performansını ölçün</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Toplam Kampanya</p>
              <p className="text-2xl font-bold mt-1">{campaigns.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Mail className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Toplam Gönderim</p>
              <p className="text-2xl font-bold mt-1">{totalSent.toLocaleString('tr-TR')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Send className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Ort. Açılma (%)</p>
              <p className="text-2xl font-bold mt-1">%{avgOpenRate}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <Eye className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Ort. Tıklama (%)</p>
              <p className="text-2xl font-bold mt-1">%{avgClickRate}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/30">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Toplam Bounce</p>
              <p className="text-2xl font-bold mt-1">{totalBounced.toLocaleString('tr-TR')}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-400/30">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-800">Kampanya Performansı</h2>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performance}>
              <defs>
                <linearGradient id="openGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              <Legend />
              <Area type="monotone" dataKey="acilma" name="Açılma" stroke="#10b981" fill="url(#openGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="tiklama" name="Tıklama" stroke="#059669" fill="url(#clickGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-800">Kampanya Listesi</h2>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36">
                <Filter className="h-3.5 w-3.5 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="draft">Taslak</SelectItem>
                <SelectItem value="scheduled">Planlanmış</SelectItem>
                <SelectItem value="sent">Gönderildi</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-1" />
                  Yeni Kampanya
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Yeni E-posta Kampanyası</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm text-slate-600">Kampanya Adı</Label>
                    <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Yılbaşı İndirimi" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">E-posta Konusu</Label>
                    <Input value={formSubject} onChange={(e) => setFormSubject(e.target.value)} placeholder="Özel Fırsatlar Sizi Bekliyor!" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">E-posta İçeriği</Label>
                    <Textarea value={formBody} onChange={(e) => setFormBody(e.target.value)} placeholder="E-posta içeriğini buraya yazın..." className="mt-1" rows={5} />
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Hedef Segment</Label>
                    <Select value={formSegment} onValueChange={setFormSegment}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Müşteriler</SelectItem>
                        <SelectItem value="new">Yeni Müşteriler</SelectItem>
                        <SelectItem value="returning">Geri Dönen Müşteriler</SelectItem>
                        <SelectItem value="vip">VIP Müşteriler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Kampanya Oluştur
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Ad</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Konu</th>
                <th className="text-left py-3 px-3 text-slate-500 font-medium">Segment</th>
                <th className="text-center py-3 px-3 text-slate-500 font-medium">Durum</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Gönderim</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Açılma</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Tıklama</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Bounce</th>
                <th className="text-right py-3 px-3 text-slate-500 font-medium">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((campaign) => {
                const sc = statusConfig[campaign.status] || statusConfig.draft;
                const openRate = campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100) : 0;
                const clickRate = campaign.opened > 0 ? ((campaign.clicked / campaign.opened) * 100) : 0;
                return (
                  <tr key={campaign.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-800 max-w-[120px] truncate">{campaign.name}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-[180px] truncate">{campaign.subject}</td>
                    <td className="py-3 px-3">
                      <Badge variant="outline" className="text-xs">{segmentLabels[campaign.segment] || campaign.segment}</Badge>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${sc.cls}`}>{sc.label}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">{campaign.sent.toLocaleString('tr-TR')}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-mono text-sm text-slate-700">{campaign.opened.toLocaleString('tr-TR')}</span>
                        <div className="w-16 bg-slate-100 rounded-full h-1">
                          <div className="h-1 rounded-full bg-emerald-500" style={{ width: `${openRate}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">%{openRate.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="font-mono text-sm text-slate-700">{campaign.clicked.toLocaleString('tr-TR')}</span>
                        <div className="w-16 bg-slate-100 rounded-full h-1">
                          <div className="h-1 rounded-full bg-emerald-400" style={{ width: `${clickRate}%` }} />
                        </div>
                        <span className="text-xs text-slate-400">%{clickRate.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {campaign.bounced > 0 ? (
                        <span className="font-mono text-red-500 text-sm">{campaign.bounced.toLocaleString('tr-TR')}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500">
                      <div className="flex items-center gap-1 justify-end">
                        <Calendar className="h-3 w-3" />
                        {new Date(campaign.date).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Kampanya bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
}
