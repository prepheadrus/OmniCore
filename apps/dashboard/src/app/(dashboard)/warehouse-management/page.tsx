import WarehouseManagement from '../../../components/warehouse-management';

export const metadata = {
  title: 'Depo Yönetimi (WMS) | Dashboard',
};

export default function WarehouseManagementPage() {
  return (
    <div className="py-6">
      <WarehouseManagement />
    </div>
  );
}
