export const mockHealthData = [
  {
    id: "1",
    marketplace: "Trendyol",
    metric: "İptal Oranı",
    value: "1.2%",
    threshold: "Max 2%",
    status: "warning",
    description: "Son 7 günde iptal edilen siparişler sınırda.",
  },
  {
    id: "2",
    marketplace: "Trendyol",
    metric: "Kargoya Teslim Süresi",
    value: "0.8 Gün",
    threshold: "Max 1 Gün",
    status: "healthy",
    description: "Siparişler zamanında kargolanıyor.",
  },
  {
    id: "3",
    marketplace: "Hepsiburada",
    metric: "Müşteri Mesaj Yanıt Süresi",
    value: "14 Saat",
    threshold: "Max 12 Saat",
    status: "critical",
    description: "Mesaj yanıt süreniz çok yüksek, Buybox kaybedilebilir.",
  },
  {
    id: "4",
    marketplace: "Amazon",
    metric: "Geç Gönderim Oranı (LSR)",
    value: "0.5%",
    threshold: "Max 4%",
    status: "healthy",
    description: "Mükemmel durumda.",
  }
];
