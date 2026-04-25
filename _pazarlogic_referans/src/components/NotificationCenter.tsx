'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  ShoppingCart,
  Package,
  Truck,
  FileText,
  XCircle,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  order: <ShoppingCart className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  success: <CheckCircle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
  error: <XCircle className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  order: 'bg-blue-100 text-blue-600',
  warning: 'bg-amber-100 text-amber-600',
  success: 'bg-emerald-100 text-emerald-600',
  info: 'bg-slate-100 text-slate-600',
  error: 'bg-red-100 text-red-600',
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setNotifications(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = async () => {
    for (const n of notifications.filter((x) => !x.isRead)) {
      await markAsRead(n.id);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-slate-200 rounded"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">Bildirimler</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            className="text-xs text-emerald-600 h-6"
          >
            Tumunu Okundu Isaretle
          </Button>
        )}
      </div>

      {notifications.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-8">Bildirim yok</p>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex gap-3 p-3 border-b hover:bg-slate-50 cursor-pointer transition-colors ${
            !n.isRead ? 'bg-blue-50/50' : ''
          }`}
          onClick={() => markAsRead(n.id)}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
              typeColors[n.type] || typeColors.info
            }`}
          >
            {typeIcons[n.type] || typeIcons.info}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
            <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(n.createdAt).toLocaleString('tr-TR')}
            </p>
          </div>
          {!n.isRead && (
            <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-2" />
          )}
        </div>
      ))}
    </div>
  );
}
