export const mockReconciliationData = [
  {
    id: "SET-8821",
    period: "15-30 Nisan 2024",
    marketplace: "Trendyol",
    expectedAmount: "₺145,200.00",
    actualAmount: "₺142,100.00",
    discrepancy: "-₺3,100.00",
    status: "mismatched", // matched, mismatched, pending
    details: "Fazla kesilen 12 kargo faturası tespit edildi."
  },
  {
    id: "SET-8822",
    period: "01-14 Nisan 2024",
    marketplace: "Hepsiburada",
    expectedAmount: "₺89,500.00",
    actualAmount: "₺89,500.00",
    discrepancy: "₺0.00",
    status: "matched",
    details: "Tüm kesintiler sistemle uyuşuyor."
  },
  {
    id: "SET-8823",
    period: "01-30 Nisan 2024",
    marketplace: "Amazon",
    expectedAmount: "₺45,000.00",
    actualAmount: "Hesaplanıyor",
    discrepancy: "-",
    status: "pending",
    details: "Pazar yeri raporu bekleniyor."
  }
];
