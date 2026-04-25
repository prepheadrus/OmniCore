'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';
import { Star, Phone, Mail, MapPin } from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  leadTime: number;
}

export default function Suppliers() {
  const { sidebarOpen } = useAppStore();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/suppliers')
      .then((r) => r.json())
      .then((d) => setSuppliers(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Tedarikciler</h1>
        <div className="animate-pulse grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Tedarikci Yonetimi</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">{s.name}</h3>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${i <= s.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" />
                  {s.phone}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  {s.email}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {s.address}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Tedarikci</span>
                  <span className="text-xs font-medium">{s.contact}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Teslimat Suresi</span>
                  <Badge variant="outline" className="text-xs">
                    {s.leadTime} gun
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
