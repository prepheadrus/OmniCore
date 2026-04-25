export interface MarketplaceOrder {
  orderId: string;
  orderNumber: string;
  status: string;
  totalPrice: number;
  currency: string;
  createdAt: Date;
  customerName: string;
  shippingAddress: string;
  items: MarketplaceOrderItem[];
}

export interface MarketplaceOrderItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
}

export interface MarketplaceProduct {
  productId: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  status: string;
}

export interface IMarketplaceAdapter {
  platformName: string;

  // Auth test
  testConnection(): Promise<boolean>;

  // Orders
  getOrders(startDate: Date, endDate: Date): Promise<MarketplaceOrder[]>;
  updateOrderStatus(orderId: string, status: string, trackingNumber?: string): Promise<boolean>;

  // Products/Stock
  getProducts(): Promise<MarketplaceProduct[]>;
  updateStock(sku: string, quantity: number): Promise<boolean>;
  updatePrice(sku: string, price: number): Promise<boolean>;
}

export interface AdapterConfig {
  apiKey: string;
  apiSecret: string;
  shopUrl?: string;
}
