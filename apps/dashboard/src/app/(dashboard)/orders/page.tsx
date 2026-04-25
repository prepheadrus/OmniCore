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
      const marketplace = searchParams.get('marketplace') || undefined;
      const dateFrom = searchParams.get('dateFrom') || undefined;
      const dateTo = searchParams.get('dateTo') || undefined;
      const carrier = searchParams.get('carrier') || undefined;

      const queryParams = new URLSearchParams();
      if (selectedChannelId) queryParams.append('channelId', selectedChannelId);
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (q) queryParams.append('q', q);
      if (status && status !== 'ALL') queryParams.append('status', status);
      if (marketplace && marketplace !== 'ALL') queryParams.append('marketplace', marketplace);
      if (dateFrom) queryParams.append('dateFrom', dateFrom);
      if (dateTo) queryParams.append('dateTo', dateTo);
      if (carrier && carrier !== 'ALL') queryParams.append('carrier', carrier);

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
          if (order.status === "PENDING") mappedStatus = "Bekliyor";
          if (order.status === "PREPARING") mappedStatus = "Hazırlanıyor";
          if (order.status === "SHIPPED") mappedStatus = "Kargoda";
          if (order.status === "DELIVERED") mappedStatus = "Teslim Edildi";
          if (order.status === "CANCELLED" || order.status === "RETURNED") mappedStatus = "İptal/İade";

          // Parse shipping address for city/district
          let parsedAddress = "";
          if (order.shippingAddr) {
            const parts = order.shippingAddr.split(/[,/]/).map((p: string) => p.trim()).filter(Boolean);
            if (parts.length >= 2) {
              parsedAddress = `${parts[parts.length - 2]} / ${parts[parts.length - 1]}`;
            } else if (order.shippingAddr.length > 30) {
              parsedAddress = `${order.shippingAddr.substring(0, 30)}...`;
            } else {
              parsedAddress = order.shippingAddr;
            }
          }

          // Parse items json
          let itemsSummary = "";
          let totalItemsCount = order.items || 1;
          try {
            if (order.itemsJson) {
              const items = typeof order.itemsJson === 'string' ? JSON.parse(order.itemsJson) : order.itemsJson;
              if (Array.isArray(items) && items.length > 0) {
                const firstItem = items[0];
                const itemName = firstItem.name || "Ürün";
                const additionalCount = items.length - 1;
                totalItemsCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);

                if (additionalCount > 0) {
                  itemsSummary = `${itemName.substring(0, 20)}... (+${additionalCount} ürün daha)`;
                } else {
                  itemsSummary = `${itemName.substring(0, 30)}${itemName.length > 30 ? '...' : ''} (${firstItem.quantity || 1} Adet)`;
                }
              }
            }
          } catch (e) {
            // Fallback
          }

          if (!itemsSummary) {
            itemsSummary = `Toplam: ${totalItemsCount} Adet`;
          }

          return {
            id: order.orderNumber || order.id,
            internalId: order.id,
            marketplaceOrderNo: order.marketplaceOrderNo,
            marketplace: order.marketplace || "Bilinmiyor",
            customerName: order.customerName || "Bilinmiyor",
            customerAddress: parsedAddress,
            itemsSummary: itemsSummary,
            date: new Date(order.createdAt).toLocaleDateString('tr-TR'),
            status: mappedStatus,
            rawStatus: order.status,
            amount: Number(order.totalAmount || 0),
            taxAmountNum: Number(order.taxAmount || 0),
            commissionAmountNum: Number(order.commissionAmount || 0),
            channel: channelName,
            carrier: order.carrier || "Belirtilmedi",
            trackingNo: order.trackingNo || "",
            invoiceStatus: order.invoiceStatus,
            invoicePdfUrl: order.invoicePdfUrl,
            shippingLabelUrl: order.shippingLabelUrl,
            netProfit: order.netProfit,
            costPrice: order.costPrice,
            shippingCost: order.shippingCost,
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
              status: "Kargoda",
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

    // Form/Sheet update
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
        <TabsList className="mb-4 bg-slate-100/50">
          <TabsTrigger value="ALL" className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md">Tümü</TabsTrigger>
          <TabsTrigger value="PENDING" className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md">Beklemede</TabsTrigger>
          <TabsTrigger value="PREPARING" className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md">Hazırlanıyor</TabsTrigger>
          <TabsTrigger value="SHIPPED" className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md">Kargoda</TabsTrigger>
          <TabsTrigger value="DELIVERED" className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md">Teslim Edildi</TabsTrigger>
          <TabsTrigger value="CANCELLED" className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-md">İptal/İade</TabsTrigger>
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
