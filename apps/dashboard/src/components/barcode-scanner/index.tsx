'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ScanBarcode, Package, Truck, PackageCheck, ArrowDownToLine, RefreshCw,
  Search, History, Warehouse, CheckCircle2, XCircle, AlertTriangle,
  ClipboardList, Scale, Printer, ArrowRightLeft, MapPin, BarChart3,
  Timer, TrendingUp, QrCode, Layers, BoxSelect, Archive, Building2,
  ChevronRight, Zap, Save, ChevronDown
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  barcode: string; name: string; sku: string; category: string; warehouse: string;
  bin: string; stock: number; reservedStock: number; weight: number; unit: string;
  lastCountDate: string; minStock: number;
  locations: { warehouse: string; bin: string; stock: number }[];
}

interface ScanEntry {
  id: string; time: string; barcode: string; productName: string;
  operationType: string; warehouse: string; bin: string; quantity: number;
  status: "Başarılı" | "Bulunamadı" | "Hata";
}

interface ReceivingItem {
  barcode: string; productName: string; quantity: number; warehouse: string;
  bin: string; confirmed: boolean;
}

interface PickItem {
  id: string; orderId: string; barcode: string; productName: string;
  sku: string; quantity: number; pickedQuantity: number; location: string; picked: boolean;
}

interface PackItem {
  orderId: string; barcode: string; productName: string; quantity: number;
  weight: number; verified: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: Product[] = [
  {
    barcode: "8690001111001", name: "Arçelik Bulaşık Makinesi 6530 HI", sku: "ARC-BM-6530",
    category: "Beyaz Eşya", warehouse: "Ana Depo A", bin: "A-12-03", stock: 45, reservedStock: 12,
    weight: 48.5, unit: "kg", lastCountDate: "2025-01-10", minStock: 10,
    locations: [{ warehouse: "Ana Depo A", bin: "A-12-03", stock: 30 }, { warehouse: "Ana Depo A", bin: "A-12-04", stock: 15 }],
  },
  {
    barcode: "8690002222002", name: "Vestel 55\" 4K UHD Smart TV", sku: "VES-TV-55UHD",
    category: "Elektronik", warehouse: "Elektronik Depo B", bin: "B-05-01", stock: 22, reservedStock: 8,
    weight: 14.2, unit: "kg", lastCountDate: "2025-01-08", minStock: 5,
    locations: [{ warehouse: "Elektronik Depo B", bin: "B-05-01", stock: 22 }],
  },
];

const INITIAL_SCAN_HISTORY: ScanEntry[] = [
  { id: "s1", time: "14:32:05", barcode: "8690001111001", productName: "Arçelik Bulaşık Makinesi 6530 HI", operationType: "Giriş", warehouse: "Ana Depo A", bin: "A-12-03", quantity: 10, status: "Başarılı" },
  { id: "s2", time: "14:28:11", barcode: "8690004444004", productName: "Samsung Galaxy S24 Ultra 256GB", operationType: "Toplama", warehouse: "Değerli Eşya C", bin: "C-02-01", quantity: 3, status: "Başarılı" },
  { id: "s3", time: "14:25:33", barcode: "9990000000001", productName: "—", operationType: "Arama", warehouse: "—", bin: "—", quantity: 0, status: "Bulunamadı" },
];

const WAREHOUSES = ["Ana Depo A", "Elektronik Depo B", "Değerli Eşya C", "İade Deposu D", "Geçici Depo E"];

const BINS_BY_WAREHOUSE: Record<string, string[]> = {
  "Ana Depo A": ["A-01-01", "A-05-02", "A-08-02", "A-12-03", "A-12-04", "A-15-06", "A-20-01", "A-20-02", "A-25-01"],
  "Elektronik Depo B": ["B-01-01", "B-03-02", "B-05-01", "B-08-01", "B-10-02"],
  "Değerli Eşya C": ["C-01-01", "C-02-01", "C-02-02", "C-03-01", "C-05-01"],
};

const MOCK_PICK_LIST: PickItem[] = [
  { id: "p1", orderId: "SIP-2025-01482", barcode: "8690001111001", productName: "Arçelik Bulaşık Makinesi 6530 HI", sku: "ARC-BM-6530", quantity: 2, pickedQuantity: 0, location: "A-12-03", picked: false },
  { id: "p2", orderId: "SIP-2025-01482", barcode: "8690006666006", productName: "Dyson V15 Detect Absolute Süpürge", sku: "DYS-V15-ABS", quantity: 1, pickedQuantity: 0, location: "A-20-01", picked: false },
];

const MOCK_PACK_LIST: PackItem[] = [
  { orderId: "SIP-2025-01482", barcode: "8690001111001", productName: "Arçelik Bulaşık Makinesi 6530 HI", quantity: 2, weight: 97.0, verified: false },
  { orderId: "SIP-2025-01482", barcode: "8690006666006", productName: "Dyson V15 Detect Absolute Süpürge", quantity: 1, weight: 3.1, verified: false },
];

function findProduct(barcode: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.barcode === barcode);
}

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("tr-TR", { hour12: false });
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ScanEntry["status"] }) {
  if (status === "Başarılı") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" />Başarılı</span>;
  if (status === "Bulunamadı") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><AlertTriangle className="w-3 h-3" />Bulunamadı</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-200"><XCircle className="w-3 h-3" />Hata</span>;
}

function ProductInfoCard({ product }: { product: Product }) {
  const isLowStock = product.stock <= product.minStock;
  return (
    <div className="bg-white rounded-md border border-emerald-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-emerald-50/50 flex items-start justify-between border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 text-emerald-600">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">{product.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">SKU: {product.sku} &middot; {product.category}</p>
          </div>
        </div>
        {isLowStock && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold bg-red-50 text-red-600 border border-red-200">
            <AlertTriangle className="w-3 h-3" /> Düşük Stok
          </span>
        )}
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Depo</p>
          <p className="font-medium text-slate-800 flex items-center gap-1.5">
            <Warehouse className="w-3.5 h-3.5 text-slate-400" /> {product.warehouse}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Raf / Lokasyon</p>
          <p className="font-medium text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {product.bin}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Mevcut Stok</p>
          <p className="font-bold text-emerald-600">{product.stock} {product.unit}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Rezerve</p>
          <p className="font-bold text-amber-600">{product.reservedStock} {product.unit}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BarcodeScanner() {
  const [activeTab, setActiveTab] = useState("search");
  const [scanHistory, setScanHistory] = useState<ScanEntry[]>(INITIAL_SCAN_HISTORY);
  const [successCount, setSuccessCount] = useState(12);
  const [notFoundCount, setNotFoundCount] = useState(2);
  const [errorCount, setErrorCount] = useState(2);

  // Shared barcode state per tab
  const [searchBarcode, setSearchBarcode] = useState("");
  const [receivingBarcode, setReceivingBarcode] = useState("");
  const [pickingBarcode, setPickingBarcode] = useState("");
  const [packingBarcode, setPackingBarcode] = useState("");
  const [countingBarcode, setCountingBarcode] = useState("");
  const [transferBarcode, setTransferBarcode] = useState("");

  // Product lookup results
  const [searchedProduct, setSearchedProduct] = useState<Product | null>(null);
  const [receivingProduct, setReceivingProduct] = useState<Product | null>(null);
  const [pickingProduct, setPickingProduct] = useState<Product | null>(null);
  const [packingProduct, setPackingProduct] = useState<Product | null>(null);
  const [countingProduct, setCountingProduct] = useState<Product | null>(null);
  const [transferProduct, setTransferProduct] = useState<Product | null>(null);

  // Tab-specific state
  const [receiveQty, setReceiveQty] = useState("");
  const [receiveWarehouse, setReceiveWarehouse] = useState("");
  const [receiveBin, setReceiveBin] = useState("");
  const [receivingLog, setReceivingLog] = useState<ReceivingItem[]>([]);

  const [pickList, setPickList] = useState<PickItem[]>(MOCK_PICK_LIST);
  const [selectedPickItem, setSelectedPickItem] = useState<PickItem | null>(null);

  const [packList, setPackList] = useState<PackItem[]>(MOCK_PACK_LIST);
  const [packWeight, setPackWeight] = useState("");

  const [countedQty, setCountedQty] = useState("");
  const [countSaved, setCountSaved] = useState(false);

  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferQty, setTransferQty] = useState("");

  // Notification dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState<"success" | "error" | "warning">("success");

  const showNotification = useCallback((title: string, message: string, type: "success" | "error" | "warning" = "success") => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogType(type);
    setDialogOpen(true);
  }, []);

  const addScanEntry = useCallback((barcode: string, product: Product | undefined, operationType: string, warehouse: string, bin: string, quantity: number, status: ScanEntry["status"]) => {
    const entry: ScanEntry = { id: `s${Date.now()}`, time: formatTime(), barcode, productName: product?.name || "—", operationType, warehouse, bin, quantity, status };
    setScanHistory((prev) => [entry, ...prev]);
    if (status === "Başarılı") setSuccessCount((c) => c + 1);
    else if (status === "Bulunamadı") setNotFoundCount((c) => c + 1);
    else if (status === "Hata") setErrorCount((c) => c + 1);
  }, []);

  const totalScans = successCount + notFoundCount + errorCount;
  const errorRate = totalScans > 0 ? ((errorCount / totalScans) * 100).toFixed(1) : "0.0";

  // Handlers
  const handleSearch = () => {
    if (!searchBarcode.trim()) return;
    const product = findProduct(searchBarcode.trim());
    if (product) {
      setSearchedProduct(product);
      addScanEntry(searchBarcode.trim(), product, "Arama", product.warehouse, product.bin, product.stock, "Başarılı");
      showNotification("Ürün Bulundu", `${product.name} barkodu sistemde mevcut.`, "success");
    } else {
      setSearchedProduct(null);
      addScanEntry(searchBarcode.trim(), undefined, "Arama", "—", "—", 0, "Bulunamadı");
      showNotification("Ürün Bulunamadı", `${searchBarcode.trim()} barkoduna ait ürün bulunamadı.`, "warning");
    }
    setSearchBarcode("");
  };

  const handleReceiving = () => {
    if (!receivingBarcode.trim()) return;
    const product = findProduct(receivingBarcode.trim());
    if (product) {
      setReceivingProduct(product);
      if (!receiveWarehouse) setReceiveWarehouse(product.warehouse);
      if (!receiveBin) setReceiveBin(product.bin);
    } else {
      setReceivingProduct(null);
      addScanEntry(receivingBarcode.trim(), undefined, "Giriş", "—", "—", 0, "Bulunamadı");
      showNotification("Ürün Bulunamadı", "Giriş yapılamadı, barkod bulunamadı.", "warning");
    }
    setReceivingBarcode("");
  };

  const confirmReceiving = () => {
    if (!receivingProduct || !receiveQty || !receiveWarehouse || !receiveBin) {
      showNotification("Eksik Bilgi", "Tüm alanları doldurunuz.", "error");
      return;
    }
    const qty = parseInt(receiveQty, 10);
    const item: ReceivingItem = { barcode: receivingProduct.barcode, productName: receivingProduct.name, quantity: qty, warehouse: receiveWarehouse, bin: receiveBin, confirmed: true };
    setReceivingLog((prev) => [item, ...prev]);
    addScanEntry(receivingProduct.barcode, receivingProduct, "Giriş", receiveWarehouse, receiveBin, qty, "Başarılı");
    showNotification("Giriş Onaylandı", `${receivingProduct.name} — ${qty} adet ${receiveWarehouse}/${receiveBin} konumuna giriş yapıldı.`, "success");
    setReceivingProduct(null); setReceiveQty(""); setReceiveWarehouse(""); setReceiveBin("");
  };

  const handlePicking = () => {
    if (!pickingBarcode.trim()) return;
    const matchedItem = pickList.find((p) => p.barcode === pickingBarcode.trim() && !p.picked);
    const product = findProduct(pickingBarcode.trim());
    if (matchedItem) {
      setSelectedPickItem(matchedItem);
      setPickingProduct(product || null);
      addScanEntry(pickingBarcode.trim(), product, "Toplama", product?.warehouse || "—", product?.bin || "—", matchedItem.quantity, "Başarılı");
      showNotification("Toplama Eşleşti", `${matchedItem.productName} sipariş listesinde bulundu.`, "success");
    } else {
      setPickingProduct(product || null);
      setSelectedPickItem(null);
      addScanEntry(pickingBarcode.trim(), product, "Toplama", product?.warehouse || "—", product?.bin || "—", 0, "Hata");
      showNotification("Eşleşme Yok", "Bu barkod aktif toplama listesinde bulunamadı.", "error");
    }
    setPickingBarcode("");
  };

  const confirmPick = () => {
    if (!selectedPickItem) return;
    const updated = { ...selectedPickItem, picked: true, pickedQuantity: selectedPickItem.quantity };
    setPickList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedPickItem(updated);
    showNotification("Toplama Onaylandı", `${selectedPickItem.productName} toplandı.`, "success");
    setTimeout(() => { setSelectedPickItem(null); setPickingProduct(null); }, 300);
  };

  const handlePacking = () => {
    if (!packingBarcode.trim()) return;
    const product = findProduct(packingBarcode.trim());
    if (product) {
      setPackingProduct(product);
      const packItem = packList.find((p) => p.barcode === packingBarcode.trim());
      if (packItem) {
        const updatedPackList = packList.map((p) => p.barcode === packingBarcode.trim() ? { ...p, verified: true } : p);
        setPackList(updatedPackList);
        addScanEntry(packingBarcode.trim(), product, "Paketleme", product.warehouse, product.bin, packItem.quantity, "Başarılı");
        showNotification("Paket Doğrulandı", `${product.name} paket listesinde doğrulandı.`, "success");
      } else {
        addScanEntry(packingBarcode.trim(), product, "Paketleme", product.warehouse, product.bin, 0, "Hata");
        showNotification("Liste Eşleşmesi Yok", "Bu ürün paket listesinde bulunamadı.", "error");
      }
    } else {
      setPackingProduct(null);
      addScanEntry(packingBarcode.trim(), undefined, "Paketleme", "—", "—", 0, "Bulunamadı");
      showNotification("Ürün Bulunamadı", "Paketleme yapılamadı.", "warning");
    }
    setPackingBarcode("");
  };

  const confirmPacking = () => {
    const allVerified = packList.every((p) => p.verified);
    if (!allVerified) { showNotification("Doğrulama Tamamlanmadı", "Tüm ürünleri tarayarak doğrulayın.", "error"); return; }
    showNotification("Paketleme Tamamlandı", "Tüm ürünler doğrulandı, kargo etiketi oluşturulabilir.", "success");
  };

  const handleCounting = () => {
    if (!countingBarcode.trim()) return;
    const product = findProduct(countingBarcode.trim());
    if (product) {
      setCountingProduct(product); setCountedQty(String(product.stock)); setCountSaved(false);
    } else {
      setCountingProduct(null);
      addScanEntry(countingBarcode.trim(), undefined, "Sayım", "—", "—", 0, "Bulunamadı");
      showNotification("Ürün Bulunamadı", "Sayım yapılamadı.", "warning");
    }
    setCountingBarcode("");
  };

  const saveCount = () => {
    if (!countingProduct || !countedQty) { showNotification("Eksik Bilgi", "Sayım miktarını girin.", "error"); return; }
    const counted = parseInt(countedQty, 10);
    const diff = counted - countingProduct.stock;
    const status: ScanEntry["status"] = diff === 0 ? "Başarılı" : "Hata";
    addScanEntry(countingProduct.barcode, countingProduct, "Sayım", countingProduct.warehouse, countingProduct.bin, counted, status);
    setCountSaved(true);
    showNotification("Sayım Kaydedildi", diff === 0 ? "Sistem stoku ile uyumlu." : `Fark: ${diff > 0 ? "+" : ""}${diff} adet`, diff === 0 ? "success" : "warning");
  };

  const handleTransfer = () => {
    if (!transferBarcode.trim()) return;
    const product = findProduct(transferBarcode.trim());
    if (product) {
      setTransferProduct(product); setTransferFrom(product.warehouse); setTransferQty(String(product.stock > 0 ? 1 : 0));
    } else {
      setTransferProduct(null);
      addScanEntry(transferBarcode.trim(), undefined, "Transfer", "—", "—", 0, "Bulunamadı");
      showNotification("Ürün Bulunamadı", "Transfer yapılamadı.", "warning");
    }
    setTransferBarcode("");
  };

  const confirmTransfer = () => {
    if (!transferProduct || !transferFrom || !transferTo || !transferQty) { showNotification("Eksik Bilgi", "Tüm alanları doldurunuz.", "error"); return; }
    if (transferFrom === transferTo) { showNotification("Geçersiz Transfer", "Kaynak ve hedef depo aynı olamaz.", "error"); return; }
    const qty = parseInt(transferQty, 10);
    if (qty > transferProduct.stock) { showNotification("Yetersiz Stok", `Mevcut stok: ${transferProduct.stock}`, "error"); return; }
    addScanEntry(transferProduct.barcode, transferProduct, "Transfer", `${transferFrom} → ${transferTo}`, transferProduct.bin, qty, "Başarılı");
    showNotification("Transfer Onaylandı", `${transferProduct.name} — ${qty} adet ${transferFrom} → ${transferTo} transfer edildi.`, "success");
    setTransferProduct(null); setTransferFrom(""); setTransferTo(""); setTransferQty("");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-800 shadow-sm">
              <ScanBarcode className="h-5 w-5 text-white" />
            </div>
            Barkod Okuma & Depo Yönetimi
          </h1>
          <p className="text-sm text-slate-500 mt-1">Depo içi ürün hareketlerini barkod ile hızlıca yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium">
            <Zap className="h-4 w-4" /> Çevrimiçi
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-xs font-medium">
            <Timer className="h-4 w-4" /> {formatTime()}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bugün Toplam</p><p className="text-3xl font-bold text-slate-800 mt-2">{totalScans}</p></div>
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100"><BarChart3 className="h-5 w-5 text-slate-600" /></div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Başarılı</p><p className="text-3xl font-bold text-emerald-600 mt-2">{successCount}</p></div>
          <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-100"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bulunamadı</p><p className="text-3xl font-bold text-amber-600 mt-2">{notFoundCount}</p></div>
          <div className="p-2.5 rounded-md bg-amber-50 border border-amber-100"><AlertTriangle className="h-5 w-5 text-amber-600" /></div>
        </div>
        <div className="bg-white p-5 rounded-md border border-slate-200 shadow-sm flex items-start justify-between">
          <div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hata Oranı</p><p className="text-3xl font-bold text-red-600 mt-2">%{errorRate}</p></div>
          <div className="p-2.5 rounded-md bg-red-50 border border-red-100"><TrendingUp className="h-5 w-5 text-red-600" /></div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200">
        {[
          { id: 'search', label: 'Ürün Arama', icon: Search },
          { id: 'receiving', label: 'Giriş (Alım)', icon: ArrowDownToLine },
          { id: 'picking', label: 'Toplama', icon: BoxSelect },
          { id: 'packing', label: 'Paketleme', icon: PackageCheck },
          { id: 'counting', label: 'Sayım', icon: ClipboardList },
          { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.id ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-md border border-slate-200 shadow-sm p-6">
        {/* TAB: SEARCH */}
        {activeTab === 'search' && (
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-base font-semibold text-slate-800">Ürün Arama</h3>
            <p className="text-sm text-slate-500">Barkod okutarak ürün detaylarını ve stok bilgilerini görüntüleyin.</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input value={searchBarcode} onChange={e => setSearchBarcode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Barkod okutun veya manuel girin..." className="w-full pl-10 pr-3 py-3 text-lg font-mono tracking-wider border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800" autoFocus />
              </div>
              <button onClick={handleSearch} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-md flex items-center gap-2 transition-colors">
                <ScanBarcode className="h-5 w-5" /> Tara
              </button>
            </div>
            {searchedProduct ? (
              <div className="mt-6 space-y-6">
                <ProductInfoCard product={searchedProduct} />
              </div>
            ) : scanHistory.some(s => s.operationType === 'Arama' && s.status === 'Bulunamadı') && (
              <div className="mt-6 p-8 border border-dashed border-slate-300 rounded-md text-center bg-slate-50">
                <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600">Ürün bulunamadı. Lütfen barkodu kontrol edin.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: RECEIVING */}
        {activeTab === 'receiving' && (
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-base font-semibold text-slate-800">Giriş (Alım)</h3>
            <p className="text-sm text-slate-500">Teslim alınan ürünleri barkod okutarak sisteme giriş yapın.</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input value={receivingBarcode} onChange={e => setReceivingBarcode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReceiving()} placeholder="Giriş yapılacak ürün barkodu..." className="w-full pl-10 pr-3 py-3 text-lg font-mono tracking-wider border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800" />
              </div>
              <button onClick={handleReceiving} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-md flex items-center gap-2 transition-colors">
                <ScanBarcode className="h-5 w-5" /> Tara
              </button>
            </div>
            {receivingProduct && (
              <div className="mt-6 space-y-6">
                <ProductInfoCard product={receivingProduct} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-md border border-slate-200">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Giriş Miktarı</label>
                    <input type="number" min="1" value={receiveQty} onChange={e => setReceiveQty(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Hedef Depo</label>
                    <div className="relative">
                      <select value={receiveWarehouse} onChange={e => { setReceiveWarehouse(e.target.value); setReceiveBin(""); }} className="w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md appearance-none focus:outline-none focus:border-slate-800 bg-white">
                        <option value="">Seçiniz...</option>
                        {WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Raf / Lokasyon</label>
                    <div className="relative">
                      <select value={receiveBin} onChange={e => setReceiveBin(e.target.value)} disabled={!receiveWarehouse} className="w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md appearance-none focus:outline-none focus:border-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-400">
                        <option value="">Seçiniz...</option>
                        {(BINS_BY_WAREHOUSE[receiveWarehouse] || []).map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <button onClick={confirmReceiving} className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors">
                  <CheckCircle2 className="h-5 w-5" /> Girişi Onayla
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: PICKING */}
        {activeTab === 'picking' && (
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-base font-semibold text-slate-800">Toplama (Picking)</h3>
            <p className="text-sm text-slate-500">Sipariş toplama listesindeki ürünleri barkod okutarak toplayın.</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input value={pickingBarcode} onChange={e => setPickingBarcode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePicking()} placeholder="Toplanacak ürün barkodu..." className="w-full pl-10 pr-3 py-3 text-lg font-mono tracking-wider border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800" />
              </div>
              <button onClick={handlePicking} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-md flex items-center gap-2 transition-colors">
                <ScanBarcode className="h-5 w-5" /> Tara
              </button>
            </div>

            {pickingProduct && selectedPickItem && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2"><ClipboardList className="h-4 w-4 text-emerald-600"/> Sipariş: {selectedPickItem.orderId}</h4>
                    <p className="text-xs text-slate-600 mt-1">Eşleşen Ürün: <strong>{selectedPickItem.productName}</strong></p>
                    <p className="text-xs text-slate-500 mt-0.5">Toplanacak Miktar: <strong>{selectedPickItem.quantity}</strong> &middot; Lokasyon: <strong>{selectedPickItem.location}</strong></p>
                  </div>
                  <button onClick={confirmPick} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md flex items-center gap-2 transition-colors">
                    <CheckCircle2 className="h-5 w-5" /> Toplamayı Onayla
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 border border-slate-200 rounded-md overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Layers className="h-4 w-4 text-slate-500"/> Aktif Toplama Listesi</span>
                <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">{pickList.filter(p => p.picked).length} / {pickList.length}</span>
              </div>
              <div className="p-2 space-y-2">
                {pickList.map(item => (
                  <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md border ${item.picked ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-start gap-3">
                      {item.picked ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> : <div className="h-5 w-5 rounded-full border-2 border-slate-300 shrink-0 mt-0.5" />}
                      <div>
                        <p className={`text-sm font-medium ${item.picked ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{item.productName}</p>
                        <p className="text-xs text-slate-500 mt-1">{item.orderId} &middot; {item.location} &middot; <strong>{item.quantity} adet</strong></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PACKING */}
        {activeTab === 'packing' && (
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-base font-semibold text-slate-800">Paketleme (Packing)</h3>
            <p className="text-sm text-slate-500">Toplanan ürünleri doğrulayın, ağırlık kontrolü yapın ve kargo etiketi oluşturun.</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input value={packingBarcode} onChange={e => setPackingBarcode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePacking()} placeholder="Doğrulanacak ürün barkodu..." className="w-full pl-10 pr-3 py-3 text-lg font-mono tracking-wider border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800" />
              </div>
              <button onClick={handlePacking} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-md flex items-center gap-2 transition-colors">
                <ScanBarcode className="h-5 w-5" /> Tara
              </button>
            </div>

            <div className="mt-6 border border-slate-200 rounded-md overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Package className="h-4 w-4 text-slate-500"/> Paket İçeriği (SIP-2025-01482)</span>
              </div>
              <div className="p-2 space-y-2 border-b border-slate-200">
                {packList.map((item, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-md border ${item.verified ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                      {item.verified ? <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" /> : <div className="h-5 w-5 rounded-full border-2 border-slate-300 shrink-0" />}
                      <span className="text-sm font-medium text-slate-800">{item.productName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1"><Scale className="h-3.5 w-3.5"/> {item.weight} kg</span>
                      <span>{item.quantity} adet</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 flex flex-col sm:flex-row items-end gap-4 justify-between">
                <div className="w-full sm:w-64">
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Ölçülen Ağırlık (kg)</label>
                  <input type="number" value={packWeight} onChange={e => setPackWeight(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={confirmPacking} className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors">
                    <CheckCircle2 className="h-5 w-5" /> Doğrula
                  </button>
                  <button disabled={!packList.every((p) => p.verified)} className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <Printer className="h-4 w-4" /> Yazdır
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: COUNTING */}
        {activeTab === 'counting' && (
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-base font-semibold text-slate-800">Sayım (Inventory Count)</h3>
            <p className="text-sm text-slate-500">Ürün barkodunu okutarak fiziksel stok sayımı yapın. Farklar otomatik hesaplanır.</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input value={countingBarcode} onChange={e => setCountingBarcode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCounting()} placeholder="Sayılacak ürün barkodu..." className="w-full pl-10 pr-3 py-3 text-lg font-mono tracking-wider border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800" />
              </div>
              <button onClick={handleCounting} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-md flex items-center gap-2 transition-colors">
                <ScanBarcode className="h-5 w-5" /> Tara
              </button>
            </div>

            {countingProduct && (
              <div className="mt-6 space-y-6">
                <ProductInfoCard product={countingProduct} />
                <div className="p-4 border border-slate-200 rounded-md">
                  <h4 className="text-sm font-semibold text-slate-800 mb-4">Stok Karşılaştırması</h4>
                  <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Sistem Stoku</p>
                      <p className="text-2xl font-bold text-slate-800">{countingProduct.stock}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-md border border-emerald-100">
                      <p className="text-xs text-emerald-700 uppercase tracking-wider mb-1">Sayılan Stok</p>
                      <p className="text-2xl font-bold text-emerald-700">{countedQty || "—"}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Fark</p>
                      {countedQty ? (() => {
                        const diff = parseInt(countedQty, 10) - countingProduct.stock;
                        return <p className={`text-2xl font-bold ${diff === 0 ? 'text-emerald-600' : diff > 0 ? 'text-blue-600' : 'text-red-600'}`}>{diff > 0 ? "+" : ""}{diff}</p>;
                      })() : <p className="text-2xl font-bold text-slate-400">—</p>}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:w-64">
                      <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Sayılan Miktar</label>
                      <input type="number" value={countedQty} onChange={e => { setCountedQty(e.target.value); setCountSaved(false); }} disabled={countSaved} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800 disabled:bg-slate-50 disabled:text-slate-500" />
                    </div>
                    <button onClick={saveCount} disabled={countSaved || !countedQty} className={`w-full sm:w-auto px-6 py-2.5 font-medium rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-80 disabled:cursor-not-allowed ${countSaved ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                      {countSaved ? <><CheckCircle2 className="h-5 w-5" /> Kaydedildi</> : <><Save className="h-5 w-5" /> Sayımı Kaydet</>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: TRANSFER */}
        {activeTab === 'transfer' && (
          <div className="space-y-6 max-w-4xl">
            <h3 className="text-base font-semibold text-slate-800">Depolar Arası Transfer</h3>
            <p className="text-sm text-slate-500">Ürünleri bir depodan başka bir depoya veya rafta transfer edin.</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input value={transferBarcode} onChange={e => setTransferBarcode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleTransfer()} placeholder="Transfer edilecek ürün barkodu..." className="w-full pl-10 pr-3 py-3 text-lg font-mono tracking-wider border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800" />
              </div>
              <button onClick={handleTransfer} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-md flex items-center gap-2 transition-colors">
                <ScanBarcode className="h-5 w-5" /> Tara
              </button>
            </div>

            {transferProduct && (
              <div className="mt-6 space-y-6">
                <ProductInfoCard product={transferProduct} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-md border border-slate-200">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Kaynak Depo</label>
                    <div className="relative">
                      <select value={transferFrom} onChange={e => setTransferFrom(e.target.value)} className="w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md appearance-none focus:outline-none focus:border-slate-800 bg-white">
                        <option value="">Seçiniz...</option>
                        {WAREHOUSES.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Hedef Depo</label>
                    <div className="relative">
                      <select value={transferTo} onChange={e => setTransferTo(e.target.value)} className="w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md appearance-none focus:outline-none focus:border-slate-800 bg-white">
                        <option value="">Seçiniz...</option>
                        {WAREHOUSES.filter(w => w !== transferFrom).map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Hedef Raf</label>
                    <div className="relative">
                      <select disabled={!transferTo} className="w-full pl-3 pr-8 py-2 text-sm border border-slate-300 rounded-md appearance-none focus:outline-none focus:border-slate-800 bg-white disabled:bg-slate-100 disabled:text-slate-400">
                        <option value="">{transferTo ? "Raf seçin..." : "Önce depo seçin"}</option>
                        {(BINS_BY_WAREHOUSE[transferTo] || []).map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Miktar (Max: {transferProduct.stock})</label>
                    <input type="number" min="1" max={transferProduct.stock} value={transferQty} onChange={e => setTransferQty(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-slate-800" />
                  </div>
                </div>
                <button onClick={confirmTransfer} className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md flex items-center justify-center gap-2 transition-colors">
                  <ArrowRightLeft className="h-5 w-5" /> Transferi Onayla
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Scan History Table */}
      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden mt-2">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <History className="h-4 w-4 text-emerald-600" /> Tarama Geçmişi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Bugün yapılan tüm barkod tarama işlemleri</p>
          </div>
          <button onClick={() => { setScanHistory([]); setSuccessCount(0); setNotFoundCount(0); setErrorCount(0); }} className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-medium rounded transition-colors flex items-center gap-1.5">
            <RefreshCw className="h-3 w-3" /> Temizle
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Zaman</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Barkod</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Ürün</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">İşlem</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider hidden md:table-cell">Depo/Raf</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider">Miktar</th>
                <th className="py-3 px-4 font-medium text-slate-500 text-xs uppercase tracking-wider text-right">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scanHistory.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-xs font-mono text-slate-500">{entry.time}</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">{entry.barcode}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate" title={entry.productName}>{entry.productName}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600 font-medium">{entry.operationType}</span></td>
                  <td className="py-3 px-4 text-slate-500 hidden md:table-cell text-xs">{entry.warehouse === '—' ? '—' : `${entry.warehouse} / ${entry.bin}`}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{entry.quantity > 0 ? entry.quantity : '—'}</td>
                  <td className="py-3 px-4 text-right"><StatusBadge status={entry.status} /></td>
                </tr>
              ))}
              {scanHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <History className="h-10 w-10 text-slate-300 mx-auto mb-3 opacity-50" />
                    Henüz tarama yapılmadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple Dialog Overlay */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md shadow-lg w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="p-5 flex flex-col items-center text-center">
              {dialogType === "success" && <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4"><CheckCircle2 className="h-6 w-6 text-emerald-600" /></div>}
              {dialogType === "error" && <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4"><XCircle className="h-6 w-6 text-red-600" /></div>}
              {dialogType === "warning" && <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4"><AlertTriangle className="h-6 w-6 text-amber-600" /></div>}
              <h3 className="text-lg font-bold text-slate-800 mb-2">{dialogTitle}</h3>
              <p className="text-sm text-slate-500">{dialogMessage}</p>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setDialogOpen(false)} className={`w-full py-2 font-medium rounded-md text-white transition-colors ${dialogType === "success" ? "bg-emerald-600 hover:bg-emerald-700" : dialogType === "warning" ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700"}`}>
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
