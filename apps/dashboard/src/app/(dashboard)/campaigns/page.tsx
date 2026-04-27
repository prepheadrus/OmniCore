import Campaigns from '../../../components/campaigns';

export const metadata = {
  title: 'Kampanya & İndirim Yönetimi | Dashboard',
};

export default function CampaignsPage() {
  return (
    <div className="py-6">
      <Campaigns />
    </div>
  );
}
