export const mockRoutingRules = [
  {
    id: "RR-001",
    name: "İstanbul İçi Siparişler",
    condition: "Teslimat İli = İstanbul",
    action: "Depo: Tuzla Ana Depo",
    priority: 1,
    status: "active",
    matches: 1245
  },
  {
    id: "RR-002",
    name: "Ağır Yük (>15 Desi)",
    condition: "Toplam Desi > 15",
    action: "Depo: Gebze Lojistik Merkezi (Kargo: Horoz)",
    priority: 2,
    status: "active",
    matches: 342
  },
  {
    id: "RR-003",
    name: "Amazon Prime Siparişleri",
    condition: "Kanal = Amazon Prime",
    action: "Depo: FBA Deposu",
    priority: 3,
    status: "active",
    matches: 890
  },
  {
    id: "RR-004",
    name: "Doğu Anadolu Hızlı Teslimat",
    condition: "Bölge = Doğu Anadolu",
    action: "Depo: Erzurum Aktarım",
    priority: 4,
    status: "paused",
    matches: 0
  }
];
