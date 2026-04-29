import { CampaignData } from "./columns";

export function generateMockCampaigns(channelId?: string): CampaignData[] {
  const marketplaces = channelId ? [channelId] : ["Trendyol", "Hepsiburada", "Amazon"];

  return Array.from({ length: 45 }).map((_, index) => {
    const marketplace = marketplaces[index % marketplaces.length];

    let status: CampaignData["status"] = "Taslak";
    const statusRand = Math.random();
    if (statusRand > 0.8) status = "Duraklatıldı";
    else if (statusRand > 0.3) status = "Aktif";
    else if (statusRand > 0.1) status = "Tamamlandı";

    let type: CampaignData["type"] = "sponsored";
    const typeRand = Math.random();
    if (typeRand > 0.7) type = "display";
    else if (typeRand > 0.4) type = "video";

    const spent = Math.floor(Math.random() * 15000);
    const budget = spent + Math.floor(Math.random() * 20000);
    const impressions = Math.floor(Math.random() * 1000000);
    const clicks = Math.floor(impressions * (Math.random() * 0.05));
    const conversions = Math.floor(clicks * (Math.random() * 0.1));

    // ROAS calculation logic from referans
    const avgOrderValue = 150;
    const roas = spent > 0 ? (conversions * avgOrderValue) / spent : 0;
    const cpc = clicks > 0 ? spent / clicks : 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    return {
      id: `camp-${index + 1000}`,
      name: `Kampanya ${index + 1} - ${marketplace}`,
      marketplace: marketplace as string,
      type,
      budget,
      dailyBudget: Math.floor(budget / 30),
      status,
      spent: Math.round(spent * 100) / 100,
      impressions,
      clicks,
      conversions,
      roas: Math.round(roas * 100) / 100,
      cpc: Math.round(cpc * 100) / 100,
      ctr: Math.round(ctr * 100) / 100,
      startDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  });
}
