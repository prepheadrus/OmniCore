export const mockRecommendationData = [
  {
    id: "REC-1",
    baseProduct: "Cilalı Oto Şampuanı (1 lt)",
    recommendedProduct: "Yıkama Eldiveni (Mikrofiber)",
    type: "cross_sell", // cross_sell, upsell, bundle
    confidence: "92%",
    potentialRevenue: "₺14,500/ay",
    status: "active"
  },
  {
    id: "REC-2",
    baseProduct: "Lastik Parlatıcı (400 ml)",
    recommendedProduct: "Lastik Parlatıcı (5 lt Pro)",
    type: "upsell",
    confidence: "78%",
    potentialRevenue: "₺8,200/ay",
    status: "suggested"
  },
  {
    id: "REC-3",
    baseProduct: "Demir Tozu Sökücü",
    recommendedProduct: "Jant Fırçası Seti",
    type: "bundle",
    confidence: "85%",
    potentialRevenue: "₺22,000/ay",
    status: "active"
  }
];
