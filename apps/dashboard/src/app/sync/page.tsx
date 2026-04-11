import SyncManager from '../../components/SyncManager';

export const metadata = {
  title: 'Senkronizasyon | Dashboard',
};

export default function SyncPage() {
  return (
    <div className="py-6">
      <SyncManager />
    </div>
  );
}
