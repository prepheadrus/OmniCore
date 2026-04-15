'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type MarketplaceId = 'trendyol' | 'hepsiburada';

interface MarketplacesState {
  trendyol: boolean;
  hepsiburada: boolean;
}

type InvoiceProvider = 'parasut' | 'bizimhesap' | 'none';
type ShippingProvider = 'yurtici' | 'mng' | 'aras' | 'none';

interface SettingsState {
  marketplaces: MarketplacesState;
  invoiceProvider: InvoiceProvider;
  shippingProvider: ShippingProvider;
  toggleMarketplace: (id: MarketplaceId) => void;
  setInvoiceProvider: (provider: InvoiceProvider) => void;
  setShippingProvider: (provider: ShippingProvider) => void;
  getActiveMarketplaces: () => string[];
}

const defaultState: SettingsState = {
  marketplaces: {
    trendyol: true,
    hepsiburada: false,
  },
  invoiceProvider: 'none',
  shippingProvider: 'none',
  toggleMarketplace: () => { /* default noop */ },
  setInvoiceProvider: () => { /* default noop */ },
  setShippingProvider: () => { /* default noop */ },
  getActiveMarketplaces: () => ['trendyol'],
};

const SettingsContext = createContext<SettingsState>(defaultState);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [marketplaces, setMarketplaces] = useState<MarketplacesState>({
    trendyol: true, // varsayılan olarak trendyol açık
    hepsiburada: false,
  });

  const [invoiceProvider, setInvoiceProvider] = useState<InvoiceProvider>('none');
  const [shippingProvider, setShippingProvider] = useState<ShippingProvider>('none');

  const toggleMarketplace = (id: MarketplaceId) => {
    setMarketplaces((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getActiveMarketplaces = () => {
    const active = [];
    if (marketplaces.trendyol) active.push('trendyol');
    if (marketplaces.hepsiburada) active.push('hepsiburada');
    return active;
  };

  return (
    <SettingsContext.Provider
      value={{
        marketplaces,
        invoiceProvider,
        shippingProvider,
        toggleMarketplace,
        setInvoiceProvider,
        setShippingProvider,
        getActiveMarketplaces,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
