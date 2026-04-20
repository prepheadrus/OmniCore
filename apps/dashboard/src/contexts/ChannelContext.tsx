'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  const [availableChannels] = useState<Channel[]>(defaultChannels);

  // Try to get initial channel from document.cookie on the client, otherwise fallback to default
  const [selectedChannelId, setSelectedChannelIdState] = useState<string>('trendyol');

  useEffect(() => {
    // Only run on client side
    const cookies = document.cookie.split(';');
    const channelCookie = cookies.find(c => c.trim().startsWith('channel-id='));
    if (channelCookie) {
      const channelId = channelCookie.split('=')[1];
      if (channelId) {
        setSelectedChannelIdState(channelId);
        return;
      }
    }
    // If no cookie, set default
    setSelectedChannelIdState(defaultChannels[0]?.id || '');
  }, []);

  const setSelectedChannelId = (id: string) => {
    setSelectedChannelIdState(id);
    document.cookie = `channel-id=${id}; path=/; max-age=31536000`; // Save for 1 year
  };

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
