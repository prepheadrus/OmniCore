export interface CompetitorData {
  date: string;
  myPrice: number;
  competitorPrice: number;
}

export class MockCompetitorDataProvider {
  /**
   * Generates mock time-series data for the last 30 days.
   * This is a stateless function that returns random but somewhat realistic data for visualization.
   */
  static getMockTimeSeriesData(basePrice: number): CompetitorData[] {
    const data: CompetitorData[] = [];
    const today = new Date();

    let currentMyPrice = basePrice;
    let currentCompetitorPrice = basePrice * 0.98; // Competitor starts slightly cheaper

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });

      // Introduce some random fluctuations (-5% to +5%)
      const myPriceFluctuation = 1 + (Math.random() * 0.1 - 0.05);
      const competitorFluctuation = 1 + (Math.random() * 0.1 - 0.05);

      currentMyPrice = Math.round(currentMyPrice * myPriceFluctuation * 100) / 100;
      currentCompetitorPrice = Math.round(currentCompetitorPrice * competitorFluctuation * 100) / 100;

      // Bound prices to be somewhat realistic (e.g., between 80% and 120% of base price)
      currentMyPrice = Math.max(basePrice * 0.8, Math.min(currentMyPrice, basePrice * 1.2));
      currentCompetitorPrice = Math.max(basePrice * 0.8, Math.min(currentCompetitorPrice, basePrice * 1.2));

      data.push({
        date: dateString,
        myPrice: currentMyPrice,
        competitorPrice: currentCompetitorPrice,
      });
    }

    return data;
  }
}
