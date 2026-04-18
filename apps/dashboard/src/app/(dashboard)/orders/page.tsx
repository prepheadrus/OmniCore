"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useChannel } from '../../../contexts/ChannelContext';
import { OrderData, OrderStatus, columns } from '../../../components/orders/columns';
import { DataTable } from '../../../components/orders/data-table';
import { DataTableSkeleton } from '../../../components/shared/data-table-skeleton';
import { toast } from "sonner";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from "@omnicore/ui/components/ui/tabs";

function OrdersPageContent() {
  const { selectedChannelId, availableChannels } = useChannel();
  const [data, setData] = useState<OrderData[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get('status') || 'ALL';

  useEffect(() => {
    const currentChannel = availableChannels.find((c: { id: string; name: string }) => c.id === selectedChannelId);
    const channelName = currentChannel ? currentChannel.name : selectedChannelId;

    const fetchData = async () => {
      setIsLoading(true);

      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const q = searchParams.get('q') || undefined;
      const status = searchParams.get('status') || undefined;

      const queryParams = new URLSearchParams();
      if (selectedChannelId) queryParams.append('channelId', selectedChannelId);
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (q) queryParams.append('q', q);
      if (status && status !== 'ALL') queryParams.append('status', status);

      try {
        const response = await fetch(`/api/orders?${queryParams.toString()}`, {
          headers: {
            'x-channel-id': queryParams.get('channelId') || 'trendyol',
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const result = await response.json();

        // Map backend order data to frontend OrderData format
        const mappedData: OrderData[] = result.data.map((order: any) => {
          let mappedStatus: OrderStatus = "Bekliyor";
          if (order.status === "SHIPPED") mappedStatus = "Kargolandı";
          if (order.status === "DELIVERED") mappedStatus = "Teslim Edildi";

          return {
            id: order.id,
            customer: order.customerName || "Bilinmiyor",
            date: new Date(order.createdAt).toLocaleDateString('tr-TR'),
            status: mappedStatus,
            amount: `₺${Number(order.totalAmount).toFixed(2)}`,
            channel: channelName,
            invoiceStatus: order.invoiceStatus,
            invoicePdfUrl: order.invoicePdfUrl,
            shippingLabelUrl: order.shippingLabelUrl,
            netProfit: order.netProfit,
            costPrice: order.costPrice,
            commissionAmount: order.commissionAmount,
            shippingCost: order.shippingCost,
            taxAmount: order.taxAmount,
            discountAmount: order.discountAmount,
          };
        });

        setData(mappedData);
        setMeta(result.meta);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedChannelId, availableChannels, searchParams]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL') {
      params.delete('status');
    } else {
      params.set('status', value);
    }
    // UX Rule: Reset page to 1 on tab change
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleUpdateOrder = (updatedOrder: any) => {
    if (typeof updatedOrder === 'string') {
      // Legacy "test action"
      const id = updatedOrder;
      setData((prev) =>
        prev.map((order) => {
          if (order.id === id) {
            toast.success(`Sipariş ${id} kargoya verildi!`);
            return {
              ...order,
              status: "Kargolandı",
              invoiceStatus: "SIGNED",
              invoicePdfUrl: "https://example.com/mock-invoice.pdf",
              shippingLabelUrl: "https://example.com/mock-label.pdf",
            };
          }
          return order;
        })
      );
      return;
    }

    // Financial Form update
    setData((prev) =>
      prev.map((order) => {
        if (order.id === updatedOrder.id) {
          return {
            ...order,
            ...updatedOrder
          };
        }
        return order;
      })
    );
  };

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

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="ALL">Tümü</TabsTrigger>
          <TabsTrigger value="PENDING">Bekleyenler</TabsTrigger>
          <TabsTrigger value="SHIPPED">Kargolananlar</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <DataTableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          meta={meta}
          onUpdateOrder={handleUpdateOrder}
        />
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<DataTableSkeleton />}>
      <OrdersPageContent />
    </Suspense>
  )
}
