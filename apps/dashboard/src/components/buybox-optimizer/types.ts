export interface Competitor {
  name: string;
  price: number;
  rating: number;
  fba: boolean;
  deliveryDays: number;
}

export interface PricePoint {
  date: string;
  ourPrice: number;
  buyBoxPrice: number;
}

export interface BuyBoxProduct {
  id: string;
  name: string;
  asin: string;
  ourPrice: number;
  buyBoxPrice: number;
  buyBoxOwner: string;
  won: boolean;
  winRate: number;
  suggestedPrice: number;
  marketplace: 'Amazon' | 'Trendyol' | 'Hepsiburada';
  competitors: Competitor[];
  priceHistory: PricePoint[];
  reasoning: string;
  lastUpdated: string;
}

export interface StrategySettings {
  targetMarketplace: string;
  pricingStrategy: 'aggressive' | 'balanced' | 'conservative';
  minPrice: number;
  maxPrice: number;
  autoRepricer: boolean;
  repricerInterval: string;
  minMarginPercent: number;
  maxDailyChanges: number;
}
