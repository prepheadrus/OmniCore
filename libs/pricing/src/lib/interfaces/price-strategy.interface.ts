export interface IPriceStrategy {
  calculatePrice(
    baseCost: number,
    competitorPrices: number[],
    competitorStockStatus: boolean[],
    minimumMargin: number
  ): number;
}
