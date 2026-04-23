import { Metadata } from 'next';
import { ProductForm } from '@omnicore/features-pim';

export const metadata: Metadata = {
  title: 'Ürün Düzenle | Omnicore',
  description: 'Gelişmiş Ürün Düzenleme Sayfası',
};

// Mock Data Generator for specific product
async function getProduct(id: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // In a real scenario, this fetches from the backend based on ID.
  // We return a rich mock object.
  return {
    id,
    name: id === "PROD-001" ? "Profesyonel Oto Yıkama Şampuanı" : "Örnek Ürün " + id,
    category: "Temizlik Kimyasalları",
    brand: "Pakbey",
    description: "Derinlemesine temizlik sağlayan yoğun köpüklü şampuan. Fırçasız yıkama için uygundur.",
    status: "IN_STOCK" as const,
    channels: ["trendyol", "hepsiburada"],
    variants: [
      {
        id: "V1",
        name: "1 Litre",
        sku: "PAK-SHMP-01-1L",
        price: 245.0,
        cost: 122.5,
        stock: 100,
        color: "Mavi",
        size: "1L",
        desi: 1.2,
        weight: 1.05,
        barcode: "8691234567890",
      },
      {
        id: "V2",
        name: "5 Litre",
        sku: "PAK-SHMP-01-5L",
        price: 850.0,
        cost: 400.0,
        stock: 50,
        color: "Mavi",
        size: "5L",
        desi: 5.5,
        weight: 5.2,
        barcode: "8691234567891",
      },
    ],
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const initialData = await getProduct(params.id);

  return <ProductForm initialData={initialData} />;
}
