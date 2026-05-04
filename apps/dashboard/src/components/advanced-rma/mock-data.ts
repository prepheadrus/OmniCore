export const mockRmaData = [
  {
    id: "RMA-1001",
    orderNo: "ORD-9982",
    product: "Cilalı Oto Şampuanı (1 lt)",
    customer: "Ahmet Yılmaz",
    reason: "Kargo Hasarı",
    status: "pending_inspection", // pending_inspection, quarantine, restocked, scrapped
    receivedDate: "2024-05-02",
    marketplace: "Trendyol"
  },
  {
    id: "RMA-1002",
    orderNo: "ORD-9844",
    product: "Lastik Parlatıcı (400 ml)",
    customer: "Mehmet Demir",
    reason: "Vazgeçti",
    status: "restocked",
    receivedDate: "2024-05-01",
    marketplace: "Hepsiburada"
  },
  {
    id: "RMA-1003",
    orderNo: "ORD-9711",
    product: "Demir Tozu Sökücü (20 lt)",
    customer: "Oto Yıkama Pro",
    reason: "Kusurlu Ürün",
    status: "quarantine",
    receivedDate: "2024-04-30",
    marketplace: "Amazon"
  }
];
