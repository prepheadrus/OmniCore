import StockSync from '../../../components/stock-sync';

export const metadata = {
  title: 'Stok Senkronizasyonu | Dashboard',
};

export default function StockSyncPage() {
  return (
    <div className="py-6">
      <StockSync />
    </div>
  );
}
