'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  const [selectedChannelId, setSelectedChannelId] = useState<string>(
    defaultChannels[0]?.id || ''
  );

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
