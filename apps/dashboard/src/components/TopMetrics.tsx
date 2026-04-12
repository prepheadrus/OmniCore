import { Wallet, ShoppingCart, AlertTriangle, Zap, TrendingUp, TrendingDown } from 'lucide-react';

const metrics = [
  {
    title: 'Toplam Ciro',
    value: '₺124.500',
    trend: '+12.5%',
    trendUp: true,
    trendGood: true,
    icon: Wallet,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  {
    title: 'Aktif Siparişler',
    value: '342',
    trend: '+8.2%',
    trendUp: true,
    trendGood: true,
    icon: ShoppingCart,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Buybox Kayıpları',
    value: '12',
    trend: '+2',
    trendUp: true,
    trendGood: false,
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    title: 'Çalışan AI Kuralları',
    value: '24',
    trend: '+4',
    trendUp: true,
    trendGood: true,
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

export default function TopMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const trendColor = metric.trendGood ? 'text-emerald-600' : 'text-red-600';
        const TrendIcon = metric.trendUp ? TrendingUp : TrendingDown;

        return (
          <div
            key={index}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{metric.title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{metric.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`flex items-center font-medium ${trendColor}`}>
                <TrendIcon className="w-4 h-4 mr-1" />
                {metric.trend}
              </span>
              <span className="text-slate-500 ml-2">geçen haftaya göre</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
