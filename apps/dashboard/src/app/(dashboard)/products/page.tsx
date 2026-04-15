"use client";

import React, { useState, useEffect } from 'react';
import { useChannel } from '../../../contexts/ChannelContext';
import { ProductData, ProductStatus, columns } from '../../../components/products/columns';
import { DataTable } from '../../../components/products/data-table';
import { DataTableSkeleton } from '../../../components/products/data-table-skeleton';

// Generate dummy data function
const generateData = (channelName: string): ProductData[] => {
  return Array.from({ length: 25 }).map((_, i) => {
    const statuses: ProductStatus[] = ["Stokta", "Tükendi", "Kritik Stok"];
    const status = statuses[i % statuses.length];
    return {
      id: `PRD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      image: "IMG",
      name: `Örnek Ürün ${i + 1}`,
      sku: `SKU-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      price: `₺${(Math.random() * 1000).toFixed(2)}`,
      stock: status === "Tükendi" ? 0 : Math.floor(Math.random() * 100) + (status === "Kritik Stok" ? 1 : 10),
      status,
      channel: channelName,
    };
  });
};

export default function ProductsPage() {
  const { selectedChannelId, availableChannels } = useChannel();
  const [data, setData] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Determine current channel name
    const currentChannel = availableChannels.find((c: { id: string; name: string }) => c.id === selectedChannelId);
    const channelName = currentChannel ? currentChannel.name : selectedChannelId;

    setIsLoading(true);

    // Simulate 1000ms delay for fetching data when channel changes
    const timer = setTimeout(() => {
      setData(generateData(channelName));
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedChannelId, availableChannels]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Ürünler
        </h1>
        <p className="text-slate-500 mt-1.5 font-medium">
          Tüm ürün kataloğunuzu, stok ve fiyatları yönetin.
        </p>
      </div>

      {isLoading ? (
        <DataTableSkeleton />
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  );
}
