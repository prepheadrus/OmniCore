import Shipments from '../../../components/shipments';

export const metadata = {
  title: 'Kargo & Lojistik | Dashboard',
};

export default function ShipmentsPage() {
  return (
    <div className="py-6">
      <Shipments />
    </div>
  );
}
