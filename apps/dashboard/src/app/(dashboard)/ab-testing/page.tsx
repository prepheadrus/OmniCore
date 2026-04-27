import AbTesting from '../../../components/ab-testing';

export const metadata = {
  title: 'A/B Test | Dashboard',
};

export default function AbTestingPage() {
  return (
    <div className="py-6">
      <AbTesting />
    </div>
  );
}
