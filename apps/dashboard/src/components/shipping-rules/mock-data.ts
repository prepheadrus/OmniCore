export const mockShippingRules = [
  {
    id: "SR-001",
    name: "Küçük Paketler (Aras Kargo)",
    condition: "Desi <= 5",
    action: "Aras Kargo Ata",
    status: "active",
  },
  {
    id: "SR-002",
    name: "Büyük Hacimli (Horoz Lojistik)",
    condition: "Desi > 25",
    action: "Horoz Lojistik Ata",
    status: "active",
  },
  {
    id: "SR-003",
    name: "Ertesi Gün Teslimat Bölgeleri",
    condition: "İl IN ('İstanbul', 'Kocaeli', 'Bursa')",
    action: "Kargoist Ata",
    status: "active",
  },
  {
    id: "SR-004",
    name: "Tehlikeli Madde Kısıtlaması",
    condition: "Kategori = 'Kimyasal'",
    action: "Yurtiçi Kargo Ata (Sadece Karayolu)",
    status: "paused",
  }
];
