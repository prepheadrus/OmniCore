"use client";

import React, { useState, useEffect } from 'react';
import { useChannel } from '../../../contexts/ChannelContext';
import { ProductData, ProductStatus, columns } from '../../../components/products/columns';
import { DataTable } from '../../../components/products/data-table';
import { DataTableSkeleton } from '../../../components/products/data-table-skeleton';
import { BundleForm } from '../../../components/products/bundle-form';
import { Button } from '@omnicore/ui/components/ui/button';
import { PackagePlus } from 'lucide-react';

// Generate dummy data function
const generateData = (channelName: string): ProductData[] => {
  return Array.from({ length: 25 }).map((_, i) => {
    const statuses: ProductStatus[] = ["Satışta", "Tükendi", "Pasif"];
    const status = statuses[i % statuses.length];

    // Rastgele 1-3 arası varyant oluştur
    const hasVariants = Math.random() > 0.5;
    const variantsCount = hasVariants ? Math.floor(Math.random() * 3) + 1 : 0;

    const id = `PRD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const subRows: ProductData[] | undefined = hasVariants ? Array.from({ length: variantsCount }).map((_, j) => ({
      id: `${id}-V${j + 1}`,
      image: "",
      name: `Varyant ${j + 1}`,
      sku: `SKU-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}-V${j+1}`,
      price: `₺${(Math.random() * 1000).toFixed(2)}`,
      stock: status === "Tükendi" ? 0 : Math.floor(Math.random() * 100) + 1,
      status,
      channel: channelName,
    })) : undefined;

    return {
      id,
      image: "IMG",
      name: `Örnek Ürün ${i + 1}`,
      sku: `SKU-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      price: `₺${(Math.random() * 1000).toFixed(2)}`,
      stock: status === "Tükendi" ? 0 : Math.floor(Math.random() * 100) + 10,
      status,
      channel: channelName,
      subRows,
    };
  });
};

export function ProductsPageContent() {
  const { selectedChannelId, availableChannels } = useChannel();
  const [data, setData] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBundleFormOpen, setIsBundleFormOpen] = useState(false);

  useEffect(() => {
    // Determine current channel name
    const currentChannel = availableChannels.find((c: { id: string; name: string }) => c.id === selectedChannelId);
    const channelName = currentChannel ? currentChannel.name : selectedChannelId;

    setIsLoading(true);

    // Simulate 1500ms delay for fetching data when channel changes
    const timer = setTimeout(() => {
      setData(generateData(channelName));
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [selectedChannelId, availableChannels]);

  if (isLoading) {
      return <DataTableSkeleton />
  }

  const handleBundleSuccess = (newBundle: ProductData) => {
    setData(prev => [newBundle, ...prev]);
  };

  return (
    <>
      <div className="absolute top-8 right-0 md:right-8 z-10">
        <Button
          onClick={() => setIsBundleFormOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-bold gap-2"
        >
          <PackagePlus className="h-4 w-4" />
          Yeni Paket/Set Oluştur
        </Button>
      </div>

      <DataTable columns={columns} data={data} setData={setData} />

      <BundleForm
        open={isBundleFormOpen}
        onOpenChange={setIsBundleFormOpen}
        existingProducts={data}
        onSuccess={handleBundleSuccess}
      />
    </>
  );
}
