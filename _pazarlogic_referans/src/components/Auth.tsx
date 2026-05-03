'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore } from '@/store/useAppStore';
import { LogIn, UserPlus, ShieldCheck, Store, Pencil, Trash2 } from 'lucide-react';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  isActive: boolean;
  lastLogin: string | null;
  storeId: string;
}

interface StoreItem {
  id: string;
  name: string;
  code: string;
  plan: string;
  isActive: boolean;
}

const roleLabels: Record<string, string> = {
  admin: 'Yonetici',
  operation: 'Operasyon',
  accounting: 'Muhasebe',
  warehouse: 'Depo',
  viewer: 'Okuma',
};

export default function Auth() {
  const { sidebarOpen } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pazarlogic-user');
      if (saved) return JSON.parse(saved);
    }
    return null;
  });
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [currentStore, setCurrentStore] = useState('STORE-001');
  const [loading, setLoading] = useState(true);
  const [showNewUser, setShowNewUser] = useState(false);
  const [editUser, setEditUser] = useState<AuthUser | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Admin', active: true });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [ipRestrictionEnabled, setIpRestrictionEnabled] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth').then((r) => r.json()),
      fetch('/api/stores').then((r) => r.json()),
    ]).then(([u, s]) => {
      setUsers(u);
      setStores(s);
      setLoading(false);
    });
  }, []);

  const handleLogin = async () => {
    setError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('pazarlogic-user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setEmail('');
      setPassword('');
    } else {
      setError(data.error || 'Giris basarisiz');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pazarlogic-user');
    setCurrentUser(null);
  };

  const handleSaveUser = () => {
    if (!newUser.name || !newUser.email) return;
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, name: newUser.name, email: newUser.email, role: newUser.role.toLowerCase(), isActive: newUser.active } : u));
    } else {
      const user: AuthUser = {
        id: `new-${Date.now()}`,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role.toLowerCase(),
        phone: '',
        isActive: newUser.active,
        lastLogin: null,
        storeId: 'STORE-001',
      };
      setUsers(prev => [user, ...prev]);
    }
    setShowNewUser(false);
    setEditUser(null);
    setNewUser({ name: '', email: '', role: 'Admin', active: true });
  };

  const handleEditUser = (user: AuthUser) => {
    setEditUser(user);
    const roleMap: Record<string, string> = { admin: 'Admin', operation: 'Operator', accounting: 'Operator', warehouse: 'Goruntuleyen', viewer: 'Goruntuleyen' };
    setNewUser({ name: user.name, email: user.email, role: roleMap[user.role] || 'Admin', active: user.isActive });
    setShowNewUser(true);
  };

  const handleDeleteUser = (user: AuthUser) => {
    if (!confirm(`"${user.name}" kullaniciyi silmek istediginize emin misiniz?`)) return;
    setUsers(prev => prev.filter(u => u.id !== user.id));
  };

  if (loading) {
    return (
      <div
        className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-slate-50 p-6 transition-all`}
      >
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Kullanici Yonetimi</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-slate-200 rounded"
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
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Kullanici Yonetimi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Login */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              {currentUser ? 'Giris Yapildi' : 'Giris Yap'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                    {currentUser.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                    <Badge className="mt-1 text-xs">
                      {roleLabels[currentUser.role]}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full"
                >
                  Cikis Yap
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Sifre</Label>
                  <Input
                    type="password"
                    placeholder="Sifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <Button
                  onClick={handleLogin}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-9"
                >
                  Giris Yap
                </Button>
                <p className="text-xs text-slate-400 text-center">
                  Demo: admin@pazarlogic.com / admin123
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Store Switcher */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-4 w-4" />
              Magaza Yonetimi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stores.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    currentStore === s.code
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setCurrentStore(s.code)}
                >
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-slate-400">
                      {s.code} - {s.plan}
                    </p>
                  </div>
                  <Badge
                    className={
                      s.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }
                  >
                    {s.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 2FA */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Guvenlik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Iki Faktorlu Dogrulama (2FA)</p>
                  <p className="text-xs text-slate-400">Ekstra guvenlik katmani</p>
                </div>
                <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
              </div>
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Oturum Zaman Asimi</p>
                  <p className="text-xs text-slate-400">30 dakika</p>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  Aktif
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium">IP Kisitlama</p>
                  <p className="text-xs text-slate-400">Belirli IP adreslerinden erisim</p>
                </div>
                <Switch checked={ipRestrictionEnabled} onCheckedChange={setIpRestrictionEnabled} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Kullanici Listesi
            </CardTitle>
            <Button size="sm" onClick={() => { setEditUser(null); setNewUser({ name: '', email: '', role: 'Admin', active: true }); setShowNewUser(true); }}><UserPlus className="h-4 w-4 mr-1" /> Yeni Kullanici</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-2.5 px-3 font-medium text-slate-600">Ad</th>
                  <th className="text-left py-2.5 px-3 font-medium text-slate-600">Email</th>
                  <th className="text-left py-2.5 px-3 font-medium text-slate-600">Rol</th>
                  <th className="text-left py-2.5 px-3 font-medium text-slate-600">Durum</th>
                  <th className="text-left py-2.5 px-3 font-medium text-slate-600">Son Giris</th>
                  <th className="text-right py-2.5 px-3 font-medium text-slate-600">Islemler</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100"
                  >
                    <td className="py-2.5 px-3 font-medium">{u.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {roleLabels[u.role] || u.role}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        className={
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }
                      >
                        {u.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-xs">
                      {u.lastLogin
                        ? new Date(u.lastLogin).toLocaleString('tr-TR')
                        : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditUser(u)}><Pencil className="h-3.5 w-3.5 mr-1" />Duzenle</Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteUser(u)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New/Edit User Dialog */}
      <Dialog open={showNewUser} onOpenChange={setShowNewUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editUser ? 'Kullanici Duzenle' : 'Yeni Kullanici'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ad Soyad</Label>
              <Input className="mt-1" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} placeholder="Ad Soyad" />
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="ornek@email.com" />
            </div>
            <div>
              <Label>Rol</Label>
              <Select value={newUser.role} onValueChange={v => setNewUser(p => ({ ...p, role: v }))}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Rol secin" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Operator">Operator</SelectItem>
                  <SelectItem value="Goruntuleyen">Goruntuleyen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="user-active" checked={newUser.active} onCheckedChange={(checked) => setNewUser(p => ({ ...p, active: checked === true }))} />
              <Label htmlFor="user-active" className="text-sm">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewUser(false)}>Iptal</Button>
            <Button onClick={handleSaveUser}>{editUser ? 'Guncelle' : 'Olustur'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
