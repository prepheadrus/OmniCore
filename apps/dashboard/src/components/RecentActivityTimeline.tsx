import { Zap, ShoppingBag, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';

const activities = [
  {
    id: 1,
    title: 'AI Asistan Fiyat Güncellemesi',
    description: '3 üründe "Kâr Maksimizasyonu" kuralı işletilerek fiyatlar %4 oranında yukarı çekildi.',
    time: '10 dakika önce',
    icon: Zap,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  {
    id: 2,
    title: 'Yeni Sipariş Akışı',
    description: 'Trendyol mağazasından 15 yeni sipariş sisteme çekildi ve stoklar rezerve edildi.',
    time: '45 dakika önce',
    icon: ShoppingBag,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    id: 3,
    title: 'Buybox Kazanımı',
    description: '"Konsantre Cam Suyu" ürününde Hepsiburada üzerinde Buybox yeniden kazanıldı.',
    time: '2 saat önce',
    icon: ArrowUpRight,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
  {
    id: 4,
    title: 'Stok Senkronizasyonu Tamamlandı',
    description: 'Tüm pazaryerlerindeki stok verileri ana depo ile eşleştirildi. (Sıfır hata)',
    time: '4 saat önce',
    icon: CheckCircle2,
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-100',
  },
];

export default function RecentActivityTimeline() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-slate-800">Son Aktiviteler</h3>
        <button className="text-[13px] font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Tümünü Gör
        </button>
      </div>

      <div className="relative border-l border-slate-200 ml-3 space-y-5 mt-2">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="relative pl-6">
              {/* Timeline dot/icon */}
              <div className={`absolute -left-[18px] top-0.5 p-1.5 rounded-full ring-4 ring-white ${activity.iconBg}`}>
                <Icon className={`w-4 h-4 ${activity.iconColor}`} />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-[13px] font-semibold text-slate-800">{activity.title}</h4>
                  <span className="flex items-center text-[11px] text-slate-500 font-medium">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </span>
                </div>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  {activity.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
