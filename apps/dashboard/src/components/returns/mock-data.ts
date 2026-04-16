export type ReturnStatus =
  | "RMA_INITIATED"
  | "IN_TRANSIT"
  | "INSPECTION_PENDING"
  | "RESTOCK"
  | "REJECTED"
  | "DISPOSED";

export interface ReturnOrder {
  id: string; // RMA-...
  orderId: string; // ORD-...
  customer: string;
  reason: string;
  amount: number;
  status: ReturnStatus;
  channel: string; // "trendyol" | "hepsiburada" | "amazon"
}

export const mockReturns: ReturnOrder[] = [
  {
    id: "RMA-10045",
    orderId: "ORD-202689",
    customer: "Ahmet Yılmaz",
    reason: "Yanlış Ürün Gönderimi",
    amount: 1450.0,
    status: "RMA_INITIATED",
    channel: "trendyol",
  },
  {
    id: "RMA-10046",
    orderId: "ORD-202690",
    customer: "Ayşe Kaya",
    reason: "Kusurlu Ürün",
    amount: 850.5,
    status: "IN_TRANSIT",
    channel: "hepsiburada",
  },
  {
    id: "RMA-10047",
    orderId: "ORD-202695",
    customer: "Mehmet Demir",
    reason: "Vazgeçtim",
    amount: 2100.0,
    status: "INSPECTION_PENDING",
    channel: "amazon",
  },
  {
    id: "RMA-10048",
    orderId: "ORD-202701",
    customer: "Zeynep Çelik",
    reason: "Beden Uyumsuzluğu",
    amount: 450.0,
    status: "RESTOCK",
    channel: "trendyol",
  },
  {
    id: "RMA-10049",
    orderId: "ORD-202715",
    customer: "Caner Şahin",
    reason: "Geciken Kargo",
    amount: 3200.0,
    status: "REJECTED",
    channel: "hepsiburada",
  },
  {
    id: "RMA-10050",
    orderId: "ORD-202720",
    customer: "Elif Aydın",
    reason: "Hasarlı Ambalaj",
    amount: 1100.25,
    status: "DISPOSED",
    channel: "amazon",
  },
  {
    id: "RMA-10051",
    orderId: "ORD-202725",
    customer: "Burak Öztürk",
    reason: "Beklentimi Karşılamadı",
    amount: 750.0,
    status: "RMA_INITIATED",
    channel: "trendyol",
  },
  {
    id: "RMA-10052",
    orderId: "ORD-202730",
    customer: "Selin Yıldız",
    reason: "Farklı Renk Geldi",
    amount: 1250.0,
    status: "IN_TRANSIT",
    channel: "amazon",
  },
  {
    id: "RMA-10053",
    orderId: "ORD-202733",
    customer: "Ozan Koç",
    reason: "Eksik Parça",
    amount: 500.0,
    status: "INSPECTION_PENDING",
    channel: "hepsiburada",
  },
  {
    id: "RMA-10054",
    orderId: "ORD-202740",
    customer: "Cemre Arslan",
    reason: "Vazgeçtim",
    amount: 900.0,
    status: "RESTOCK",
    channel: "trendyol",
  },
];
