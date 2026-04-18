"use client";

import React, { useState, useEffect } from 'react';
import { useChannel } from '../../../contexts/ChannelContext';
import { ProductData, ProductStatus, columns } from '../../../components/products/columns';
import { DataTable } from '../../../components/products/data-table';
import { DataTableSkeleton } from '../../../components/shared/data-table-skeleton';
import { BundleForm } from '../../../components/products/bundle-form';
import { Button } from '@omnicore/ui/components/ui/button';
import { PackagePlus } from 'lucide-react';
import { GetProductsFilterDto } from '../../../../../../libs/core-domain/src/lib/dto';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from "@omnicore/ui/components/ui/tabs";

// Mock data fetcher with pagination and filtering
const fetchMockData = (dto: GetProductsFilterDto, channelName: string) => {
  return new Promise<{ data: ProductData[], meta: { total: number, page: number, limit: number, totalPages: number } }>((resolve) => {
    setTimeout(() => {
      const page = dto.page || 1;
      const limit = dto.limit || 10;
      const query = dto.q?.toLowerCase() || "";
      const stockStatus = dto.stockStatus;

      let allData = Array.from({ length: 45 }).map((_, i) => {
        const statuses: ProductStatus[] = ["Satışta", "Tükendi", "Pasif"];
        const status = statuses[i % statuses.length];

        const hasVariants = Math.random() > 0.5;
        const variantsCount = hasVariants ? Math.floor(Math.random() * 3) + 1 : 0;
        const id = `PRD-${(i + 1).toString().padStart(4, '0')}`;

        const subRows: ProductData[] | undefined = hasVariants ? Array.from({ length: variantsCount }).map((_, j) => ({
          id: `${id}-V${j + 1}`,
          image: "",
          name: `Varyant ${j + 1}`,
          sku: `SKU-${(i + 1).toString().padStart(5, '0')}-V${j+1}`,
          price: `₺${((i+j+1)*50).toFixed(2)}`,
          stock: status === "Tükendi" ? 0 : Math.floor(Math.random() * 100) + 1,
          status,
          channel: channelName,
        })) : undefined;

        return {
          id,
          image: "IMG",
          name: `Örnek Ürün ${i + 1}`,
          sku: `SKU-${(i + 1).toString().padStart(5, '0')}`,
          price: `₺${((i+1)*100).toFixed(2)}`,
          stock: status === "Tükendi" ? 0 : Math.floor(Math.random() * 100) + 10,
          status,
          channel: channelName,
          subRows,
        };
      });

      if (query) {
         allData = allData.filter(item =>
           item.name.toLowerCase().includes(query) ||
           item.sku.toLowerCase().includes(query)
         );
      }

      if (stockStatus === 'out_of_stock') {
         allData = allData.filter(item => item.status === "Tükendi");
      }

      const total = allData.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedData = allData.slice((page - 1) * limit, page * limit);

      resolve({
         data: paginatedData,
         meta: { total, page, limit, totalPages }
      });
    }, 500);
  });
};

export function ProductsPageContent() {
  const { selectedChannelId, availableChannels } = useChannel();
  const [data, setData] = useState<ProductData[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isBundleFormOpen, setIsBundleFormOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get('stockStatus') || 'ALL';

  useEffect(() => {
    const currentChannel = availableChannels.find((c: { id: string; name: string }) => c.id === selectedChannelId);
    const channelName = currentChannel ? currentChannel.name : selectedChannelId;

    const fetchData = async () => {
      setIsLoading(true);

      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const q = searchParams.get('q') || undefined;
      const stockStatus = searchParams.get('stockStatus') || undefined;

      const dto: GetProductsFilterDto = {
        channelId: selectedChannelId,
        page,
        limit,
        q,
        stockStatus,
      };

      try {
        const result = await fetchMockData(dto, channelName);
        setData(result.data);
        setMeta(result.meta);
      } catch(error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedChannelId, availableChannels, searchParams]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'ALL') {
      params.delete('stockStatus');
    } else {
      params.set('stockStatus', value);
    }
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

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

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="ALL">Tümü</TabsTrigger>
          <TabsTrigger value="out_of_stock">Tükenenler</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <DataTableSkeleton />
      ) : (
        <DataTable columns={columns} data={data} meta={meta} setData={setData} />
      )}

      <BundleForm
        open={isBundleFormOpen}
        onOpenChange={setIsBundleFormOpen}
        existingProducts={data}
        onSuccess={handleBundleSuccess}
      />
    </>
  );
}
