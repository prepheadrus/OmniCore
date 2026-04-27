import BarcodeScanner from '../../../components/barcode-scanner';

export const metadata = {
  title: 'Barkod Okuma & Depo | Dashboard',
};

export default function BarcodeScannerPage() {
  return (
    <div className="py-6">
      <BarcodeScanner />
    </div>
  );
}
