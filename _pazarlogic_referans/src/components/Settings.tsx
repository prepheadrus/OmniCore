'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/useAppStore';
import { useLicenseStore } from '@/store/useLicenseStore';
import { IntegrationModal } from './IntegrationModal';
import { Cog as CogIcon, Store, ShoppingCart, FileText, Truck, Warehouse, Globe, Link2, CheckCircle, XCircle, RefreshCw, Shield } from 'lucide-react';

interface Integration { id: string; name: string; type: string; platform: string; status: string; }

const groups: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: 'marketplace', label: 'Pazaryerleri', icon: <Store className="h-5 w-5" /> },
  { key: 'ecommerce', label: 'E-Ticaret', icon: <ShoppingCart className="h-5 w-5" /> },
  { key: 'erp', label: 'ERP Sistemleri', icon: <Globe className="h-5 w-5" /> },
  { key: 'einvoce', label: 'E-Fatura', icon: <FileText className="h-5 w-5" /> },
  { key: 'cargo', label: 'Kargo', icon: <Truck className="h-5 w-5" /> },
  { key: 'warehouse', label: 'Depo', icon: <Warehouse className="h-5 w-5" /> },
];

const typeLabels: Record<string, string> = { trial: 'Deneme', basic: 'Temel', pro: 'Profesyonel', enterprise: 'Kurumsal' };

const defaultIntegrations: Integration[] = [
  { id: 'demo-1', name: 'Trendyol', type: 'marketplace', platform: 'Trendyol', status: 'disconnected' },
  { id: 'demo-2', name: 'Hepsiburada', type: 'marketplace', platform: 'Hepsiburada', status: 'disconnected' },
  { id: 'demo-3', name: 'Amazon TR', type: 'marketplace', platform: 'Amazon', status: 'disconnected' },
  { id: 'demo-4', name: 'n11', type: 'marketplace', platform: 'n11', status: 'disconnected' },
  { id: 'demo-5', name: 'Ciceksepeti', type: 'marketplace', platform: 'Ciceksepeti', status: 'disconnected' },
  { id: 'demo-6', name: 'Shopify', type: 'ecommerce', platform: 'Shopify', status: 'disconnected' },
  { id: 'demo-7', name: 'WooCommerce', type: 'ecommerce', platform: 'WooCommerce', status: 'disconnected' },
  { id: 'demo-8', name: 'Logo ERP', type: 'erp', platform: 'Logo', status: 'disconnected' },
  { id: 'demo-9', name: 'Netsis ERP', type: 'erp', platform: 'Netsis', status: 'disconnected' },
  { id: 'demo-10', name: 'E-Fatura (GIB)', type: 'einvoce', platform: 'GIB', status: 'disconnected' },
  { id: 'demo-11', name: 'Aras Kargo', type: 'cargo', platform: 'Aras', status: 'disconnected' },
  { id: 'demo-12', name: 'Yurtici Kargo', type: 'cargo', platform: 'Yurtici', status: 'disconnected' },
  { id: 'demo-13', name: 'HepsiJet', type: 'cargo', platform: 'HepsiJet', status: 'disconnected' },
  { id: 'demo-14', name: 'Depo Yonetimi', type: 'warehouse', platform: 'Depo', status: 'disconnected' },
];

export default function Settings() {
  const { sidebarOpen } = useAppStore();
  const license = useLicenseStore();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  useEffect(() => {
    const loadIntegrations = () => {
      fetch('/api/integrations')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setIntegrations(data);
        } else {
          setIntegrations(defaultIntegrations);
        }
      })
      .catch(() => setIntegrations(defaultIntegrations))
      .finally(() => setLoading(false));
    };
    loadIntegrations();
  }, []);

  if (loading) return (<div className={`${sidebarOpen?'lg:ml-64':'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}><h1 className="mb-6 text-2xl font-bold text-slate-800">Entegrasyon Ayarlari</h1><div className="animate-pulse space-y-4">{[1,2,3].map(i=><Card key={i}><CardContent className="p-5"><div className="h-20 bg-slate-200 rounded"/></CardContent></Card>)}</div></div>);

  return (
    <div className={`${sidebarOpen?'lg:ml-64':'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <IntegrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} integration={selectedIntegration} onSuccess={() => { window.location.reload(); }} />
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-slate-800">Entegrasyon Ayarlari</h1><p className="text-sm text-slate-500">Bagli pazaryerleri ve hizmetleri yonetin</p></div>
      </div>

      {/* License Section */}
      <Card className="mb-6 border-emerald-200 bg-emerald-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-600"/>Lisans Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><p className="text-xs text-slate-500">Lisans Turu</p><p className="font-semibold text-slate-800">{typeLabels[license.licenseType] || license.licenseType || 'Aktif Degil'}</p></div>
            <div><p className="text-xs text-slate-500">Lisans Sahibi</p><p className="font-semibold text-slate-800">{license.ownerName || '-'}</p></div>
            <div><p className="text-xs text-slate-500">Firma</p><p className="font-semibold text-slate-800">{license.company || '-'}</p></div>
            <div><p className="text-xs text-slate-500">Son Kullanma</p><p className="font-semibold text-slate-800">{license.expiresAt ? new Date(license.expiresAt).toLocaleDateString('tr-TR') : '-'}</p></div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {groups.map((g) => {
        const items = integrations.filter((i) => i.type === g.key);
        if (items.length === 0) return null;
        return (
          <div key={g.key} className="mb-6">
            <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2 mb-3">{g.icon} {g.label}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {items.map((item) => (
                <Card key={item.id} className="cursor-pointer hover:border-emerald-500 transition-colors" onClick={() => { setSelectedIntegration(item); setIsModalOpen(true); }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.platform}</p>
                      </div>
                      {item.status === 'connected' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs gap-1"><CheckCircle className="h-3 w-3"/>Bagli</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 text-xs gap-1"><XCircle className="h-3 w-3"/>Bagli Degil</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
