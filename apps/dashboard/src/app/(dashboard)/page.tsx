import TopMetrics from '../../components/TopMetrics';
import WeeklySalesChart from '../../components/WeeklySalesChart';
import RecentActivityTimeline from '../../components/RecentActivityTimeline';

export default function Index() {
  // Format the current date elegantly (e.g., "12 Nisan 2026, Pazar")
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  };
  const formattedDate = today.toLocaleDateString('tr-TR', dateOptions);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* 1. Karşılama Alanı */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hoş Geldiniz, Demo User</h1>
          <p className="text-slate-500 mt-1.5 font-medium">{formattedDate}</p>
        </div>
      </div>

      {/* 2. Özet Metrik Kartları (Top Cards) */}
      <TopMetrics />

      {/* 3 & 4. Ana Grafik Alanı & Son Aktiviteler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklySalesChart />
        </div>
        <div className="lg:col-span-1">
          <RecentActivityTimeline />
        </div>
      </div>
    </div>
  );
}
