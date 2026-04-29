"use client";

import { useState, useEffect } from "react";
import { DataTable } from "./data-table";
import { columns, CampaignData } from "./columns";
import { DataTableSkeleton } from "./data-table-skeleton";
import { useChannel } from "../../contexts/ChannelContext";
import { generateMockCampaigns } from "./mock-data";

export function AdvertisingClient() {
  const { selectedChannelId } = useChannel();
  const [data, setData] = useState<CampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Simulate network delay
    const timer = setTimeout(() => {
      setData(generateMockCampaigns(selectedChannelId || undefined));
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [selectedChannelId]);

  if (isLoading) {
    return <DataTableSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
