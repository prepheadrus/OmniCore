import SmartOrderRules from '../../../components/smart-order-rules';

export const metadata = {
  title: 'Akıllı Sipariş Kuralları | Dashboard',
};

export default function SmartOrderRulesPage() {
  return (
    <div className="py-6">
      <SmartOrderRules />
    </div>
  );
}
