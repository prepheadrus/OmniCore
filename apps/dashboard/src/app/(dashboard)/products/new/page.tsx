import { Metadata } from 'next';
import { ProductForm } from '@omnicore/features-pim';

export const metadata: Metadata = {
  title: 'Yeni Ürün | Omnicore',
  description: 'Sisteme yeni bir ürün ekleyin.',
};

export default function NewProductPage() {
  return <ProductForm />;
}
