'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export interface Channel {
  id: string;
  name: string;
}

interface ChannelState {
  availableChannels: Channel[];
  selectedChannelId: string;
  setSelectedChannelId: (id: string) => void;
}

const defaultChannels: Channel[] = [
  { id: 'trendyol', name: 'Trendyol' },
  { id: 'hepsiburada', name: 'Hepsiburada' },
  { id: 'amazon', name: 'Amazon' },
];

const defaultState: ChannelState = {
  availableChannels: defaultChannels,
  selectedChannelId: 'trendyol',
  setSelectedChannelId: () => { /* default noop */ },
};

const ChannelContext = createContext<ChannelState>(defaultState);

export function ChannelProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [availableChannels] = useState<Channel[]>(defaultChannels);

  // Initialize from URL if present, otherwise default to first channel
  const [selectedChannelId, setLocalSelectedChannelId] = useState<string>(() => {
    const channelFromUrl = searchParams.get('channelId');
    if (channelFromUrl && defaultChannels.some(c => c.id === channelFromUrl)) {
      return channelFromUrl;
    }
    return defaultChannels[0]?.id || 'trendyol';
  });

  // Sync to URL when channel changes programmatically
  const setSelectedChannelId = useCallback((id: string) => {
    setLocalSelectedChannelId(id);

    // Create new URL search params
    const params = new URLSearchParams(searchParams.toString());
    params.set('channelId', id);

    // Replace URL without scrolling
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // Sync from URL if it changes (e.g. back button)
  useEffect(() => {
    const channelFromUrl = searchParams.get('channelId');
    if (channelFromUrl && channelFromUrl !== selectedChannelId && availableChannels.some(c => c.id === channelFromUrl)) {
      setLocalSelectedChannelId(channelFromUrl);
    } else if (!channelFromUrl) {
      // Ensure the URL always has the channelId if not present
      const params = new URLSearchParams(searchParams.toString());
      params.set('channelId', selectedChannelId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, selectedChannelId, availableChannels, pathname, router]);

  return (
    <ChannelContext.Provider
      value={{
        availableChannels,
        selectedChannelId,
        setSelectedChannelId,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannel() {
  const context = useContext(ChannelContext);
  if (context === undefined) {
    throw new Error('useChannel must be used within a ChannelProvider');
  }
  return context;
}
