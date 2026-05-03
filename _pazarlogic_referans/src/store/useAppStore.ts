import { create } from 'zustand';

export type PageKey =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'feeds'
  | 'feed-templates'
  | 'feed-optimizer'
  | 'smart-pricing'
  | 'stock-sync'
  | 'roi-profit'
  | 'content-rules'
  | 'data-automation'
  | 'fulfillment'
  | 'customers'
  | 'pricing'
  | 'invoices'
  | 'shipments'
  | 'returns'
  | 'warehouse'
  | 'automation'
  | 'reports'
  | 'campaigns'
  | 'suppliers'
  | 'micro-export'
  | 'audit'
  | 'settings'
  | 'webhooks'
  | 'ai-seo'
  | 'live-chat'
  | 'advertising'
  | 'competitor-prices'
  | 'multi-currency'
  | 'purchase-orders'
  | 'inventory-forecast'
  | 'listing-quality'
  | 'carrier-rates'
  | 'email-campaigns'
  | 'ab-testing'
  | 'dropshipping'
  | 'bundle-management'
  | 'buy-box'
  | 'b2b-management'
  | 'dynamic-repricer'
  | 'smart-order-rules'
  | 'performance-scorecard'
  | 'social-commerce'
  | 'barcode-scanner'
  | 'ai-content'
  | 'brand-protection'
  | 'smart-alerts'
  | 'product-launches'
  | 'tax-compliance'
  | 'profit-simulator'
  | 'price-monitor'
  | 'customer-questions'
  | 'kvkk-compliance'
  | 'opportunity-finder'
  | 'cash-flow'
  | 'review-analysis'
  | 'bulk-operations'
  | 'commission-tracker'
  | 'sales-trends';

interface AppState {
  currentPage: PageKey;
  sidebarOpen: boolean;
  setCurrentPage: (page: PageKey) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'dashboard',
  sidebarOpen: true,
  setCurrentPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
