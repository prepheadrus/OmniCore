import ProfitSimulator from '../../../components/profit-simulator';

export const metadata = {
  title: 'Kar Marjı Simülatörü | Dashboard',
};

export default function ProfitSimulatorPage() {
  return (
    <div className="py-6">
      <ProfitSimulator />
    </div>
  );
}
