"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable } from "./data-table";
import { columns, CampaignData } from "./columns";
import { DataTableSkeleton } from "./data-table-skeleton";
import { useChannel } from "../../contexts/ChannelContext";
import { generateMockCampaigns } from "./mock-data";
import { AdvertisingDashboard } from "./advertising-dashboard";

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
    return (
      <div className="flex-1 flex flex-col gap-6">
        <DataTableSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden bg-[#fbfcfc]">
      <div className="p-0">
        <AdvertisingDashboard data={data} />
      </div>
      <div className="flex-1 w-full bg-white rounded-md border border-slate-200 flex flex-col shadow-none overflow-hidden mx-0">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
