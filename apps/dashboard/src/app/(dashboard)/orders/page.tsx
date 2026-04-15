"use client";

import React, { useState, useEffect } from 'react';
import { useChannel } from '../../../contexts/ChannelContext';
import { OrderData, OrderStatus, columns } from '../../../components/orders/columns';
import { DataTable } from '../../../components/orders/data-table';
import { DataTableSkeleton } from '../../../components/orders/data-table-skeleton';

// Generate dummy data function
const generateData = (channelName: string): OrderData[] => {
  return Array.from({ length: 25 }).map((_, i) => {
    const statuses: OrderStatus[] = ["Bekliyor", "Kargolandı", "Teslim Edildi"];
    const status = statuses[i % statuses.length];
    return {
      id: `ORD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      customer: `Müşteri ${i + 1}`,
      date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString('tr-TR'),
      status,
      amount: `₺${(Math.random() * 1000).toFixed(2)}`,
      channel: channelName,
    };
  });
};

export default function OrdersPage() {
  const { selectedChannelId, availableChannels } = useChannel();
  const [data, setData] = useState<OrderData[]>([]);
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
          Siparişler
        </h1>
        <p className="text-slate-500 mt-1.5 font-medium">
          Tüm siparişlerinizi ve durumlarını yönetin.
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
