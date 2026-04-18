"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useChannel } from '../../../contexts/ChannelContext';
import { OrderData, OrderStatus, columns } from '../../../components/orders/columns';
import { DataTable } from '../../../components/orders/data-table';
import { DataTableSkeleton } from '../../../components/orders/data-table-skeleton';
import { toast } from "sonner";
import { GetOrdersFilterDto } from '../../../../../../libs/core-domain/src/lib/dto';
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

  // Dummy data generator with pagination simulation
  const fetchMockData = (dto: GetOrdersFilterDto, channelName: string) => {
    return new Promise<{ data: OrderData[], meta: { total: number, page: number, limit: number, totalPages: number } }>((resolve) => {
      setTimeout(() => {
        const page = dto.page || 1;
        const limit = dto.limit || 10;
        const query = dto.q?.toLowerCase() || "";
        const statusFilter = dto.status;

        let allData = Array.from({ length: 55 }).map((_, i) => {
          const statuses: OrderStatus[] = ["Bekliyor", "Kargolandı", "Teslim Edildi"];
          const status = statuses[i % statuses.length];
          return {
            id: `ORD-${(i + 1).toString().padStart(4, '0')}`,
            customer: `Müşteri ${i + 1}`,
            date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString('tr-TR'),
            status,
            amount: `₺${((i+1) * 10).toFixed(2)}`,
            channel: channelName,
            invoiceStatus: status === "Teslim Edildi" ? "SIGNED" : "PENDING",
            invoicePdfUrl: status === "Teslim Edildi" ? "https://example.com/invoice.pdf" : undefined,
            shippingLabelUrl: status !== "Bekliyor" ? "https://example.com/label.pdf" : undefined,
          };
        });

        // Apply filters
        if (query) {
          allData = allData.filter(item =>
            item.customer.toLowerCase().includes(query) ||
            item.id.toLowerCase().includes(query)
          );
        }

        if (statusFilter && statusFilter !== 'ALL') {
          const statusMap: Record<string, string> = {
            'PENDING': 'Bekliyor',
            'SHIPPED': 'Kargolandı'
          };
          const mappedStatus = statusMap[statusFilter];
          if (mappedStatus) {
             allData = allData.filter(item => item.status === mappedStatus);
          }
        }

        const total = allData.length;
        const totalPages = Math.ceil(total / limit);
        const paginatedData = allData.slice((page - 1) * limit, page * limit);

        resolve({
          data: paginatedData,
          meta: { total, page, limit, totalPages }
        });
      }, 500); // 500ms mock delay
    });
  };

  useEffect(() => {
    const currentChannel = availableChannels.find((c: { id: string; name: string }) => c.id === selectedChannelId);
    const channelName = currentChannel ? currentChannel.name : selectedChannelId;

    const fetchData = async () => {
      setIsLoading(true);

      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const q = searchParams.get('q') || undefined;
      const status = searchParams.get('status') || undefined;

      const dto: GetOrdersFilterDto = {
        channelId: selectedChannelId,
        page,
        limit,
        q,
        status,
      };

      try {
        const result = await fetchMockData(dto, channelName);
        setData(result.data);
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

  const handleUpdateOrder = (id: string) => {
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
