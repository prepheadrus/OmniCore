'use client';

import { useState, useEffect } from 'react';
import { useLicenseStore } from '@/store/useLicenseStore';
import { useAppStore } from '@/store/useAppStore';
import { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { Bell } from 'lucide-react';

function useMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

const LicenseActivation = dynamic(() => import('@/components/LicenseActivation'), { ssr: false });
const Sidebar = dynamic(() => import('@/components/Sidebar'), { ssr: false });
const Dashboard = dynamic(() => import('@/components/Dashboard'), { ssr: false });
const Orders = dynamic(() => import('@/components/Orders'), { ssr: false });
const Products = dynamic(() => import('@/components/Products'), { ssr: false });
const Pricing = dynamic(() => import('@/components/Pricing'), { ssr: false });
const Invoices = dynamic(() => import('@/components/Invoices'), { ssr: false });
const Shipments = dynamic(() => import('@/components/Shipments'), { ssr: false });
const WarehouseManagement = dynamic(() => import('@/components/WarehouseManagement'), { ssr: false });
const Reports = dynamic(() => import('@/components/Reports'), { ssr: false });
const MicroExport = dynamic(() => import('@/components/MicroExport'), { ssr: false });
const Returns = dynamic(() => import('@/components/Returns'), { ssr: false });
const Customers = dynamic(() => import('@/components/Customers'), { ssr: false });
const Automation = dynamic(() => import('@/components/Automation'), { ssr: false });
const Campaigns = dynamic(() => import('@/components/Campaigns'), { ssr: false });
const Suppliers = dynamic(() => import('@/components/Suppliers'), { ssr: false });
const AuditLog = dynamic(() => import('@/components/AuditLog'), { ssr: false });
const Settings = dynamic(() => import('@/components/Settings'), { ssr: false });
const Webhooks = dynamic(() => import('@/components/Webhooks'), { ssr: false });
const ProductFeeds = dynamic(() => import('@/components/ProductFeeds'), { ssr: false });
const FeedTemplates = dynamic(() => import('@/components/FeedTemplates'), { ssr: false });
const SmartPricing = dynamic(() => import('@/components/SmartPricing'), { ssr: false });
const StockSync = dynamic(() => import('@/components/StockSync'), { ssr: false });
const ROIProfit = dynamic(() => import('@/components/ROIProfit'), { ssr: false });
const ContentRules = dynamic(() => import('@/components/ContentRules'), { ssr: false });
const FeedOptimizer = dynamic(() => import('@/components/FeedOptimizer'), { ssr: false });
const FulfillmentPipeline = dynamic(() => import('@/components/FulfillmentPipeline'), { ssr: false });
const DataAutomation = dynamic(() => import('@/components/DataAutomation'), { ssr: false });
const AiSeo = dynamic(() => import('@/components/AiSeo'), { ssr: false });
const LiveChat = dynamic(() => import('@/components/LiveChat'), { ssr: false });
const Advertising = dynamic(() => import('@/components/Advertising'), { ssr: false });
const CompetitorPrices = dynamic(() => import('@/components/CompetitorPrices'), { ssr: false });
const MultiCurrency = dynamic(() => import('@/components/MultiCurrency'), { ssr: false });
const PurchaseOrders = dynamic(() => import('@/components/PurchaseOrders'), { ssr: false });
const InventoryForecast = dynamic(() => import('@/components/InventoryForecast'), { ssr: false });
const ListingQuality = dynamic(() => import('@/components/ListingQuality'), { ssr: false });
const CarrierRates = dynamic(() => import('@/components/CarrierRates'), { ssr: false });
const EmailCampaigns = dynamic(() => import('@/components/EmailCampaigns'), { ssr: false });
const AbTesting = dynamic(() => import('@/components/AbTesting'), { ssr: false });
const Dropshipping = dynamic(() => import('@/components/Dropshipping'), { ssr: false });
const SocialCommerce = dynamic(() => import('@/components/SocialCommerce'), { ssr: false });
const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), { ssr: false });
const BundleManagement = dynamic(() => import('@/components/BundleManagement'), { ssr: false });
const BuyBoxOptimizer = dynamic(() => import('@/components/BuyBoxOptimizer'), { ssr: false });
const B2BManagement = dynamic(() => import('@/components/B2BManagement'), { ssr: false });
const DynamicRepricer = dynamic(() => import('@/components/DynamicRepricer'), { ssr: false });
const SmartOrderRules = dynamic(() => import('@/components/SmartOrderRules'), { ssr: false });
const PerformanceScorecard = dynamic(() => import('@/components/PerformanceScorecard'), { ssr: false });
const AiContentStudio = dynamic(() => import('@/components/AiContentStudio'), { ssr: false });
const BrandProtection = dynamic(() => import('@/components/BrandProtection'), { ssr: false });
const SmartAlerts = dynamic(() => import('@/components/SmartAlerts'), { ssr: false });
const ProductLaunchCalendar = dynamic(() => import('@/components/ProductLaunchCalendar'), { ssr: false });
const TaxCompliance = dynamic(() => import('@/components/TaxCompliance'), { ssr: false });
const ProfitSimulator = dynamic(() => import('@/components/ProfitSimulator'), { ssr: false });

const pages: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  orders: Orders,
  products: Products,
  feeds: ProductFeeds,
  'feed-templates': FeedTemplates,
  'smart-pricing': SmartPricing,
  'stock-sync': StockSync,
  'roi-profit': ROIProfit,
  'content-rules': ContentRules,
  'feed-optimizer': FeedOptimizer,
  fulfillment: FulfillmentPipeline,
  'data-automation': DataAutomation,
  customers: Customers,
  pricing: Pricing,
  invoices: Invoices,
  shipments: Shipments,
  returns: Returns,
  warehouse: WarehouseManagement,
  automation: Automation,
  reports: Reports,
  campaigns: Campaigns,
  suppliers: Suppliers,
  'micro-export': MicroExport,
  audit: AuditLog,
  settings: Settings,
  webhooks: Webhooks,
  'ai-seo': AiSeo,
  'live-chat': LiveChat,
  'advertising': Advertising,
  'competitor-prices': CompetitorPrices,
  'multi-currency': MultiCurrency,
  'purchase-orders': PurchaseOrders,
  'inventory-forecast': InventoryForecast,
  'listing-quality': ListingQuality,
  'carrier-rates': CarrierRates,
  'email-campaigns': EmailCampaigns,
  'ab-testing': AbTesting,
  'dropshipping': Dropshipping,
  'social-commerce': SocialCommerce,
  'barcode-scanner': BarcodeScanner,
  'bundle-management': BundleManagement,
  'buy-box': BuyBoxOptimizer,
  'b2b-management': B2BManagement,
  'dynamic-repricer': DynamicRepricer,
  'smart-order-rules': SmartOrderRules,
  'performance-scorecard': PerformanceScorecard,
  'ai-content': AiContentStudio,
  'brand-protection': BrandProtection,
  'smart-alerts': SmartAlerts,
  'product-launches': ProductLaunchCalendar,
  'tax-compliance': TaxCompliance,
  'profit-simulator': ProfitSimulator,
};

function AppContent() {
  const { currentPage, sidebarOpen } = useAppStore();
  const PageComponent = pages[currentPage] || Dashboard;
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then((data) => {
      setUnreadCount(data.filter((n: { isRead: boolean }) => !n.isRead).length);
    });
    const interval = setInterval(() => {
      fetch('/api/notifications').then(r => r.json()).then((data) => {
        setUnreadCount(data.filter((n: { isRead: boolean }) => !n.isRead).length);
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      {/* Header Bar */}
      <div className={`fixed top-0 right-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 transition-all ${sidebarOpen ? 'left-64' : 'left-16'}`}>
        <div className="text-sm text-slate-500">
          PazarLogic
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Bell className="h-5 w-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {/* User */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
              {typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('pazarlogic-user') || '{}').name || 'U')[0] : 'U'}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <div className={`fixed top-16 right-0 z-40 bg-white border-l border-b border-slate-200 shadow-lg transition-all ${sidebarOpen ? 'left-64' : 'left-16'}`}>
          <div onClick={(e) => { if (e.target === e.currentTarget) setShowNotifications(false); }} className="p-2">
            <div id="notification-container" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-16">
        <PageComponent />
      </div>
    </div>
  );
}

export default function Home() {
  const isActivated = useLicenseStore((s) => s.isActivated);
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Yukleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isActivated) {
    return <LicenseActivation />;
  }

  return <AppContent />;
}
