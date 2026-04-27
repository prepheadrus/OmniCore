import FulfillmentPipeline from '../../../components/fulfillment-pipeline';

export const metadata = {
  title: 'Sipariş Karşılama | Dashboard',
};

export default function FulfillmentPipelinePage() {
  return (
    <div className="py-6">
      <FulfillmentPipeline />
    </div>
  );
}
