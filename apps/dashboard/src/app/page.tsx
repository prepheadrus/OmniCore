import DashboardCharts from '../components/DashboardCharts';
import SyncSummaryCard from '../components/SyncSummaryCard';

export default function Index() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">E-ticaret yönetim paneline hoş geldiniz.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <DashboardCharts />
        </div>
        <div className="md:col-span-1">
          <SyncSummaryCard />
        </div>
      </div>
    </div>
  );
}
