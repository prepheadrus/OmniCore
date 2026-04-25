'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLicenseStore } from '@/store/useLicenseStore';

export default function LicenseActivation() {
  const { setLicense } = useLicenseStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'choose' | 'activate' | 'trial'>('choose');
  const [formData, setFormData] = useState({ key: '', name: '', email: '', company: '' });

  const handleActivate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate', key: formData.key, ownerName: formData.name, ownerEmail: formData.email, company: formData.company }),
      });
      const data = await res.json();
      if (data.success) {
        setLicense({ key: data.license.key, type: data.license.licenseType, ownerName: data.license.ownerName, company: data.license.company, expiresAt: data.license.expiresAt, status: data.license.status });
      } else {
        setError(data.error || 'Aktivasyon basarisiz');
      }
    } catch {
      setError('Sunucu hatasi');
    }
    setLoading(false);
  };

  const handleTrial = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trial', ownerName: formData.name, ownerEmail: formData.email, company: formData.company }),
      });
      const data = await res.json();
      if (data.success) {
        setLicense({ key: data.license.key, type: data.license.licenseType, ownerName: data.license.ownerName, company: data.license.company, expiresAt: data.license.expiresAt, status: data.license.status });
      } else {
        setError(data.error || 'Trial basarisiz');
      }
    } catch {
      setError('Sunucu hatasi');
    }
    setLoading(false);
  };

  if (mode === 'choose') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <span className="text-2xl font-black text-white">P</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">PazarLogic</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Pazaryeri Entegrasyon Yonetim Paneli</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 text-center">Lutfen lisans aktivasyon yonteminizi secin</p>
            <Button onClick={() => setMode('activate')} className="w-full h-12 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700">
              Lisans Anahtari ile Aktivasyon
            </Button>
            <Button onClick={() => setMode('trial')} variant="outline" className="w-full h-12 text-sm font-semibold border-slate-300">
              14 Gun Ucretsiz Dene
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <span className="text-xl font-black text-white">P</span>
            </div>
          </div>
          <CardTitle className="text-xl font-bold">
            {mode === 'activate' ? 'Lisans Aktivasyonu' : 'Ucretsiz Deneme'}
          </CardTitle>
          <p className="text-sm text-slate-500">
            {mode === 'activate' ? 'Lisans anahtarinizi girin' : '14 gun ucretsiz kullanin'}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {mode === 'activate' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Lisans Anahtari</Label>
              <Input placeholder="PL-XXXX-XXXX-XXXX-XXXX" value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} className="h-10" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Ad Soyad</Label>
            <Input placeholder="Adiniz Soyadiniz" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">E-posta</Label>
            <Input placeholder="ornek@email.com" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Firma</Label>
            <Input placeholder="Firma adiniz (opsiyonel)" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="h-10" />
          </div>
          {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setMode('choose')} className="flex-1 h-10">Geri</Button>
            <Button onClick={mode === 'activate' ? handleActivate : handleTrial} disabled={loading} className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700">
              {loading ? 'Isleniyor...' : mode === 'activate' ? 'Aktiflestir' : 'Dene'}
            </Button>
          </div>
          {mode === 'trial' && (
            <p className="text-xs text-slate-400 text-center pt-1">Demo lisans anahtari: PL-TRIAL-2024-DEMO-KEY</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
