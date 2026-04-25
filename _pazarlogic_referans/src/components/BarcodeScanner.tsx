"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ScanBarcode,
  Package,
  Truck,
  PackageCheck,
  ArrowDownToLine,
  RefreshCw,
  Search,
  History,
  Warehouse,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ClipboardList,
  Scale,
  Printer,
  ArrowRightLeft,
  MapPin,
  BarChart3,
  Timer,
  TrendingUp,
  QrCode,
  Layers,
  BoxSelect,
  Archive,
  Building2,
  ChevronRight,
  Zap,
  Save,
} from "lucide-react";
import { useAppStore } from '@/store/useAppStore';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  barcode: string;
  name: string;
  sku: string;
  category: string;
  warehouse: string;
  bin: string;
  stock: number;
  reservedStock: number;
  weight: number;
  unit: string;
  lastCountDate: string;
  minStock: number;
  locations: { warehouse: string; bin: string; stock: number }[];
}

interface ScanEntry {
  id: string;
  time: string;
  barcode: string;
  productName: string;
  operationType: string;
  warehouse: string;
  bin: string;
  quantity: number;
  status: "Başarılı" | "Bulunamadı" | "Hata";
}

interface ReceivingItem {
  barcode: string;
  productName: string;
  quantity: number;
  warehouse: string;
  bin: string;
  confirmed: boolean;
}

interface PickItem {
  id: string;
  orderId: string;
  barcode: string;
  productName: string;
  sku: string;
  quantity: number;
  pickedQuantity: number;
  location: string;
  picked: boolean;
}

interface PackItem {
  orderId: string;
  barcode: string;
  productName: string;
  quantity: number;
  weight: number;
  verified: boolean;
}

interface CountItem {
  barcode: string;
  productName: string;
  systemStock: number;
  countedStock: number;
  difference: number;
  saved: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: Product[] = [
  {
    barcode: "8690001111001",
    name: "Arçelik Bulaşık Makinesi 6530 HI",
    sku: "ARC-BM-6530",
    category: "Beyaz Eşya",
    warehouse: "Ana Depo A",
    bin: "A-12-03",
    stock: 45,
    reservedStock: 12,
    weight: 48.5,
    unit: "kg",
    lastCountDate: "2025-01-10",
    minStock: 10,
    locations: [
      { warehouse: "Ana Depo A", bin: "A-12-03", stock: 30 },
      { warehouse: "Ana Depo A", bin: "A-12-04", stock: 15 },
    ],
  },
  {
    barcode: "8690002222002",
    name: "Vestel 55\" 4K UHD Smart TV",
    sku: "VES-TV-55UHD",
    category: "Elektronik",
    warehouse: "Elektronik Depo B",
    bin: "B-05-01",
    stock: 22,
    reservedStock: 8,
    weight: 14.2,
    unit: "kg",
    lastCountDate: "2025-01-08",
    minStock: 5,
    locations: [
      { warehouse: "Elektronik Depo B", bin: "B-05-01", stock: 22 },
    ],
  },
  {
    barcode: "8690003333003",
    name: "Bosch Kombini Çamaşır Kurutma WGG244A9TR",
    sku: "BOS-CK-244A9",
    category: "Beyaz Eşya",
    warehouse: "Ana Depo A",
    bin: "A-08-02",
    stock: 8,
    reservedStock: 3,
    weight: 72.0,
    unit: "kg",
    lastCountDate: "2025-01-12",
    minStock: 5,
    locations: [
      { warehouse: "Ana Depo A", bin: "A-08-02", stock: 8 },
    ],
  },
  {
    barcode: "8690004444004",
    name: "Samsung Galaxy S24 Ultra 256GB",
    sku: "SAM-S24U-256",
    category: "Telefon & Aksesuar",
    warehouse: "Değerli Eşya C",
    bin: "C-02-01",
    stock: 120,
    reservedStock: 65,
    weight: 0.23,
    unit: "kg",
    lastCountDate: "2025-01-11",
    minStock: 20,
    locations: [
      { warehouse: "Değerli Eşya C", bin: "C-02-01", stock: 80 },
      { warehouse: "Değerli Eşya C", bin: "C-02-02", stock: 40 },
    ],
  },
  {
    barcode: "8690005555005",
    name: "Philips Airfryer XXL HD9870",
    sku: "PHI-AF-XXL9870",
    category: "Küçük Ev Aletleri",
    warehouse: "Ana Depo A",
    bin: "A-15-06",
    stock: 3,
    reservedStock: 1,
    weight: 5.8,
    unit: "kg",
    lastCountDate: "2025-01-05",
    minStock: 15,
    locations: [
      { warehouse: "Ana Depo A", bin: "A-15-06", stock: 3 },
    ],
  },
  {
    barcode: "8690006666006",
    name: "Dyson V15 Detect Absolute Süpürge",
    sku: "DYS-V15-ABS",
    category: "Küçük Ev Aletleri",
    warehouse: "Ana Depo A",
    bin: "A-20-01",
    stock: 18,
    reservedStock: 6,
    weight: 3.1,
    unit: "kg",
    lastCountDate: "2025-01-09",
    minStock: 8,
    locations: [
      { warehouse: "Ana Depo A", bin: "A-20-01", stock: 12 },
      { warehouse: "Ana Depo A", bin: "A-20-02", stock: 6 },
    ],
  },
];

const INITIAL_SCAN_HISTORY: ScanEntry[] = [
  {
    id: "s1",
    time: "14:32:05",
    barcode: "8690001111001",
    productName: "Arçelik Bulaşık Makinesi 6530 HI",
    operationType: "Giriş",
    warehouse: "Ana Depo A",
    bin: "A-12-03",
    quantity: 10,
    status: "Başarılı",
  },
  {
    id: "s2",
    time: "14:28:11",
    barcode: "8690004444004",
    productName: "Samsung Galaxy S24 Ultra 256GB",
    operationType: "Toplama",
    warehouse: "Değerli Eşya C",
    bin: "C-02-01",
    quantity: 3,
    status: "Başarılı",
  },
  {
    id: "s3",
    time: "14:25:33",
    barcode: "9990000000001",
    productName: "—",
    operationType: "Arama",
    warehouse: "—",
    bin: "—",
    quantity: 0,
    status: "Bulunamadı",
  },
  {
    id: "s4",
    time: "14:20:47",
    barcode: "8690002222002",
    productName: "Vestel 55\" 4K UHD Smart TV",
    operationType: "Paketleme",
    warehouse: "Elektronik Depo B",
    bin: "B-05-01",
    quantity: 1,
    status: "Başarılı",
  },
  {
    id: "s5",
    time: "14:15:02",
    barcode: "8690005555005",
    productName: "Philips Airfryer XXL HD9870",
    operationType: "Sayım",
    warehouse: "Ana Depo A",
    bin: "A-15-06",
    quantity: 3,
    status: "Başarılı",
  },
  {
    id: "s6",
    time: "14:10:18",
    barcode: "8690003333003",
    productName: "Bosch Kombini Çamaşır Kurutma WGG244A9TR",
    operationType: "Transfer",
    warehouse: "Ana Depo A",
    bin: "A-08-02",
    quantity: 5,
    status: "Hata",
  },
  {
    id: "s7",
    time: "13:58:44",
    barcode: "8690006666006",
    productName: "Dyson V15 Detect Absolute Süpürge",
    operationType: "Giriş",
    warehouse: "Ana Depo A",
    bin: "A-20-01",
    quantity: 20,
    status: "Başarılı",
  },
  {
    id: "s8",
    time: "13:52:30",
    barcode: "8690001111001",
    productName: "Arçelik Bulaşık Makinesi 6530 HI",
    operationType: "Toplama",
    warehouse: "Ana Depo A",
    bin: "A-12-03",
    quantity: 2,
    status: "Başarılı",
  },
  {
    id: "s9",
    time: "13:45:15",
    barcode: "8880000000001",
    productName: "—",
    operationType: "Arama",
    warehouse: "—",
    bin: "—",
    quantity: 0,
    status: "Bulunamadı",
  },
  {
    id: "s10",
    time: "13:38:22",
    barcode: "8690004444004",
    productName: "Samsung Galaxy S24 Ultra 256GB",
    operationType: "Giriş",
    warehouse: "Değerli Eşya C",
    bin: "C-02-02",
    quantity: 50,
    status: "Başarılı",
  },
  {
    id: "s11",
    time: "13:30:09",
    barcode: "8690002222002",
    productName: "Vestel 55\" 4K UHD Smart TV",
    operationType: "Sayım",
    warehouse: "Elektronik Depo B",
    bin: "B-05-01",
    quantity: 22,
    status: "Başarılı",
  },
  {
    id: "s12",
    time: "13:22:55",
    barcode: "8690005555005",
    productName: "Philips Airfryer XXL HD9870",
    operationType: "Toplama",
    warehouse: "Ana Depo A",
    bin: "A-15-06",
    quantity: 1,
    status: "Başarılı",
  },
  {
    id: "s13",
    time: "13:15:41",
    barcode: "8690003333003",
    productName: "Bosch Kombini Çamaşır Kurutma WGG244A9TR",
    operationType: "Paketleme",
    warehouse: "Ana Depo A",
    bin: "A-08-02",
    quantity: 1,
    status: "Başarılı",
  },
  {
    id: "s14",
    time: "13:08:03",
    barcode: "8690006666006",
    productName: "Dyson V15 Detect Absolute Süpürge",
    operationType: "Transfer",
    warehouse: "Ana Depo A",
    bin: "A-20-01",
    quantity: 8,
    status: "Başarılı",
  },
  {
    id: "s15",
    time: "12:58:37",
    barcode: "7770000000001",
    productName: "—",
    operationType: "Giriş",
    warehouse: "—",
    bin: "—",
    quantity: 0,
    status: "Hata",
  },
  {
    id: "s16",
    time: "12:50:19",
    barcode: "8690001111001",
    productName: "Arçelik Bulaşık Makinesi 6530 HI",
    operationType: "Sayım",
    warehouse: "Ana Depo A",
    bin: "A-12-03",
    quantity: 45,
    status: "Başarılı",
  },
  {
    id: "s17",
    time: "12:42:08",
    barcode: "8690004444004",
    productName: "Samsung Galaxy S24 Ultra 256GB",
    operationType: "Toplama",
    warehouse: "Değerli Eşya C",
    bin: "C-02-02",
    quantity: 5,
    status: "Başarılı",
  },
  {
    id: "s18",
    time: "12:35:54",
    barcode: "8690002222002",
    productName: "Vestel 55\" 4K UHD Smart TV",
    operationType: "Transfer",
    warehouse: "Elektronik Depo B",
    bin: "B-05-01",
    quantity: 3,
    status: "Başarılı",
  },
];

const WAREHOUSES = [
  "Ana Depo A",
  "Elektronik Depo B",
  "Değerli Eşya C",
  "İade Deposu D",
  "Geçici Depo E",
];

const BINS_BY_WAREHOUSE: Record<string, string[]> = {
  "Ana Depo A": [
    "A-01-01", "A-05-02", "A-08-02", "A-12-03", "A-12-04",
    "A-15-06", "A-20-01", "A-20-02", "A-25-01",
  ],
  "Elektronik Depo B": ["B-01-01", "B-03-02", "B-05-01", "B-08-01", "B-10-02"],
  "Değerli Eşya C": ["C-01-01", "C-02-01", "C-02-02", "C-03-01", "C-05-01"],
  "İade Deposu D": ["D-01-01", "D-02-01", "D-03-01", "D-04-01"],
  "Geçici Depo E": ["E-01-01", "E-02-01", "E-03-01"],
};

const MOCK_PICK_LIST: PickItem[] = [
  {
    id: "p1",
    orderId: "SIP-2025-01482",
    barcode: "8690001111001",
    productName: "Arçelik Bulaşık Makinesi 6530 HI",
    sku: "ARC-BM-6530",
    quantity: 2,
    pickedQuantity: 0,
    location: "A-12-03",
    picked: false,
  },
  {
    id: "p2",
    orderId: "SIP-2025-01482",
    barcode: "8690006666006",
    productName: "Dyson V15 Detect Absolute Süpürge",
    sku: "DYS-V15-ABS",
    quantity: 1,
    pickedQuantity: 0,
    location: "A-20-01",
    picked: false,
  },
  {
    id: "p3",
    orderId: "SIP-2025-01483",
    barcode: "8690004444004",
    productName: "Samsung Galaxy S24 Ultra 256GB",
    sku: "SAM-S24U-256",
    quantity: 3,
    pickedQuantity: 0,
    location: "C-02-01",
    picked: false,
  },
  {
    id: "p4",
    orderId: "SIP-2025-01484",
    barcode: "8690002222002",
    productName: 'Vestel 55" 4K UHD Smart TV',
    sku: "VES-TV-55UHD",
    quantity: 1,
    pickedQuantity: 0,
    location: "B-05-01",
    picked: false,
  },
  {
    id: "p5",
    orderId: "SIP-2025-01485",
    barcode: "8690005555005",
    productName: "Philips Airfryer XXL HD9870",
    sku: "PHI-AF-XXL9870",
    quantity: 1,
    pickedQuantity: 0,
    location: "A-15-06",
    picked: false,
  },
];

const MOCK_PACK_LIST: PackItem[] = [
  {
    orderId: "SIP-2025-01482",
    barcode: "8690001111001",
    productName: "Arçelik Bulaşık Makinesi 6530 HI",
    quantity: 2,
    weight: 97.0,
    verified: false,
  },
  {
    orderId: "SIP-2025-01482",
    barcode: "8690006666006",
    productName: "Dyson V15 Detect Absolute Süpürge",
    quantity: 1,
    weight: 3.1,
    verified: false,
  },
];

const OPERATION_TYPES: Record<string, string> = {
  search: "Arama",
  receiving: "Giriş",
  picking: "Toplama",
  packing: "Paketleme",
  counting: "Sayım",
  transfer: "Transfer",
};

// ─── Helper ──────────────────────────────────────────────────────────────────

function findProduct(barcode: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.barcode === barcode);
}

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("tr-TR", { hour12: false });
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ScanEntry["status"] }) {
  switch (status) {
    case "Başarılı":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          <CheckCircle2 className="size-3 mr-1" />
          Başarılı
        </Badge>
      );
    case "Bulunamadı":
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
          <AlertTriangle className="size-3 mr-1" />
          Bulunamadı
        </Badge>
      );
    case "Hata":
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
          <XCircle className="size-3 mr-1" />
          Hata
        </Badge>
      );
  }
}

function ProductInfoCard({ product }: { product: Product }) {
  const isLowStock = product.stock <= product.minStock;
  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-950">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
              <Package className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">{product.name}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                SKU: {product.sku} &middot; {product.category}
              </CardDescription>
            </div>
          </div>
          {isLowStock && (
            <Badge variant="destructive" className="text-xs shrink-0">
              <AlertTriangle className="size-3 mr-1" />
              Düşük Stok
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-xs">Depo</p>
            <p className="font-medium flex items-center gap-1">
              <Warehouse className="size-3.5 text-slate-400" />
              {product.warehouse}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Raf / Lokasyon</p>
            <p className="font-medium flex items-center gap-1">
              <MapPin className="size-3.5 text-slate-400" />
              {product.bin}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Mevcut Stok</p>
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">
              {product.stock} {product.unit}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Rezerve</p>
            <p className="font-medium text-amber-600">
              {product.reservedStock} {product.unit}
            </p>
          </div>
        </div>
        {product.locations.length > 1 && (
          <>
            <Separator className="my-3" />
            <p className="text-xs text-muted-foreground mb-2">Diğer Lokasyonlar</p>
            <div className="flex flex-wrap gap-2">
              {product.locations.map((loc, idx) => (
                <Badge key={idx} variant="outline" className="text-xs font-normal">
                  {loc.warehouse} / {loc.bin} → <span className="font-semibold ml-1">{loc.stock}</span>
                </Badge>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function BarcodeInput({
  value,
  onChange,
  placeholder,
  onSubmit,
  autoFocus = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onSubmit: () => void;
  autoFocus?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          placeholder={placeholder || "Barkod okutun veya manuel girin..."}
          autoFocus={autoFocus}
          className="pl-10 h-14 text-lg font-mono tracking-widest border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/30 bg-white dark:bg-slate-900"
        />
      </div>
      <Button
        onClick={onSubmit}
        size="lg"
        className="h-14 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
      >
        <ScanBarcode className="size-5 mr-2" />
        Tara
      </Button>
    </div>
  );
}

function RecentScans({
  scans,
  max = 5,
}: {
  scans: ScanEntry[];
  max?: number;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <History className="size-4 text-slate-500" />
        <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Son Taramalar
        </h4>
      </div>
      <ScrollArea className="max-h-48">
        <div className="space-y-2">
          {scans.slice(0, max).map((scan) => (
            <div
              key={scan.id}
              className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-muted-foreground font-mono shrink-0">{scan.time}</span>
                <span className="font-mono font-medium truncate">{scan.barcode}</span>
                <ChevronRight className="size-3 text-slate-300 shrink-0" />
                <span className="truncate">{scan.productName}</span>
              </div>
              <StatusBadge status={scan.status} />
            </div>
          ))}
          {scans.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Henüz tarama yapılmadı
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BarcodeScanner() {
  // Global state
  const { sidebarOpen } = useAppStore();
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
  const [packVerified, setPackVerified] = useState(false);

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

  const showNotification = useCallback(
    (title: string, message: string, type: "success" | "error" | "warning" = "success") => {
      setDialogTitle(title);
      setDialogMessage(message);
      setDialogType(type);
      setDialogOpen(true);
    },
    []
  );

  const addScanEntry = useCallback(
    (
      barcode: string,
      product: Product | undefined,
      operationType: string,
      warehouse: string,
      bin: string,
      quantity: number,
      status: ScanEntry["status"]
    ) => {
      const entry: ScanEntry = {
        id: `s${Date.now()}`,
        time: formatTime(),
        barcode,
        productName: product?.name || "—",
        operationType,
        warehouse,
        bin,
        quantity,
        status,
      };
      setScanHistory((prev) => [entry, ...prev]);
      if (status === "Başarılı") setSuccessCount((c) => c + 1);
      else if (status === "Bulunamadı") setNotFoundCount((c) => c + 1);
      else if (status === "Hata") setErrorCount((c) => c + 1);
    },
    []
  );

  const totalScans = successCount + notFoundCount + errorCount;
  const errorRate = totalScans > 0 ? ((errorCount / totalScans) * 100).toFixed(1) : "0.0";

  // ── Tab handlers ──

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
    const item: ReceivingItem = {
      barcode: receivingProduct.barcode,
      productName: receivingProduct.name,
      quantity: qty,
      warehouse: receiveWarehouse,
      bin: receiveBin,
      confirmed: true,
    };
    setReceivingLog((prev) => [item, ...prev]);
    addScanEntry(
      receivingProduct.barcode,
      receivingProduct,
      "Giriş",
      receiveWarehouse,
      receiveBin,
      qty,
      "Başarılı"
    );
    showNotification(
      "Giriş Onaylandı",
      `${receivingProduct.name} — ${qty} adet ${receiveWarehouse}/${receiveBin} konumuna giriş yapıldı.`,
      "success"
    );
    setReceivingProduct(null);
    setReceiveQty("");
    setReceiveWarehouse("");
    setReceiveBin("");
  };

  const handlePicking = () => {
    if (!pickingBarcode.trim()) return;
    const matchedItem = pickList.find((p) => p.barcode === pickingBarcode.trim() && !p.picked);
    if (matchedItem) {
      setSelectedPickItem(matchedItem);
      const product = findProduct(pickingBarcode.trim());
      setPickingProduct(product || null);
      addScanEntry(pickingBarcode.trim(), product, "Toplama", product?.warehouse || "—", product?.bin || "—", matchedItem.quantity, "Başarılı");
      showNotification("Toplama Eşleşti", `${matchedItem.productName} sipariş listesinde bulundu.`, "success");
    } else {
      const product = findProduct(pickingBarcode.trim());
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
    // Update pickList immutably
    setPickList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedPickItem(updated);
    showNotification("Toplama Onaylandı", `${selectedPickItem.productName} toplandı.`, "success");
    setTimeout(() => {
      setSelectedPickItem(null);
      setPickingProduct(null);
    }, 300);
  };

  const handlePacking = () => {
    if (!packingBarcode.trim()) return;
    const product = findProduct(packingBarcode.trim());
    if (product) {
      setPackingProduct(product);
      const packItem = packList.find((p) => p.barcode === packingBarcode.trim());
      if (packItem) {
        const updatedPackList = packList.map((p) =>
          p.barcode === packingBarcode.trim() ? { ...p, verified: true } : p
        );
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
    if (!allVerified) {
      showNotification("Doğrulama Tamamlanmadı", "Tüm ürünleri tarayarak doğrulayın.", "error");
      return;
    }
    showNotification("Paketleme Tamamlandı", "Tüm ürünler doğrulandı, kargo etiketi oluşturulabilir.", "success");
  };

  const handleCounting = () => {
    if (!countingBarcode.trim()) return;
    const product = findProduct(countingBarcode.trim());
    if (product) {
      setCountingProduct(product);
      setCountedQty(String(product.stock));
      setCountSaved(false);
    } else {
      setCountingProduct(null);
      addScanEntry(countingBarcode.trim(), undefined, "Sayım", "—", "—", 0, "Bulunamadı");
      showNotification("Ürün Bulunamadı", "Sayım yapılamadı.", "warning");
    }
    setCountingBarcode("");
  };

  const saveCount = () => {
    if (!countingProduct || !countedQty) {
      showNotification("Eksik Bilgi", "Sayım miktarını girin.", "error");
      return;
    }
    const counted = parseInt(countedQty, 10);
    const diff = counted - countingProduct.stock;
    const status: ScanEntry["status"] = diff === 0 ? "Başarılı" : "Hata";
    addScanEntry(
      countingProduct.barcode,
      countingProduct,
      "Sayım",
      countingProduct.warehouse,
      countingProduct.bin,
      counted,
      status
    );
    setCountSaved(true);
    showNotification(
      "Sayım Kaydedildi",
      diff === 0
        ? "Sistem stoku ile uyumlu."
        : `Fark: ${diff > 0 ? "+" : ""}${diff} adet`,
      diff === 0 ? "success" : "warning"
    );
  };

  const handleTransfer = () => {
    if (!transferBarcode.trim()) return;
    const product = findProduct(transferBarcode.trim());
    if (product) {
      setTransferProduct(product);
      setTransferFrom(product.warehouse);
      setTransferQty(String(product.stock > 0 ? 1 : 0));
    } else {
      setTransferProduct(null);
      addScanEntry(transferBarcode.trim(), undefined, "Transfer", "—", "—", 0, "Bulunamadı");
      showNotification("Ürün Bulunamadı", "Transfer yapılamadı.", "warning");
    }
    setTransferBarcode("");
  };

  const confirmTransfer = () => {
    if (!transferProduct || !transferFrom || !transferTo || !transferQty) {
      showNotification("Eksik Bilgi", "Tüm alanları doldurunuz.", "error");
      return;
    }
    if (transferFrom === transferTo) {
      showNotification("Geçersiz Transfer", "Kaynak ve hedef depo aynı olamaz.", "error");
      return;
    }
    const qty = parseInt(transferQty, 10);
    if (qty > transferProduct.stock) {
      showNotification("Yetersiz Stok", `Mevcut stok: ${transferProduct.stock}`, "error");
      return;
    }
    addScanEntry(
      transferProduct.barcode,
      transferProduct,
      "Transfer",
      `${transferFrom} → ${transferTo}`,
      transferProduct.bin,
      qty,
      "Başarılı"
    );
    showNotification(
      "Transfer Onaylandı",
      `${transferProduct.name} — ${qty} adet ${transferFrom} → ${transferTo} transfer edildi.`,
      "success"
    );
    setTransferProduct(null);
    setTransferFrom("");
    setTransferTo("");
    setTransferQty("");
  };

  // ── Render ──

  return (
    <div className={`${sidebarOpen ? 'lg:ml-64' : 'ml-16'} min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-slate-950 dark:to-slate-900 transition-all`}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-md dark:bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <ScanBarcode className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                PazarLogic WMS
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Barkod Okuma & Depo Yönetimi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1.5 border-emerald-200 text-emerald-700 dark:text-emerald-400">
              <Zap className="size-3" />
              Çevrimiçi
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Timer className="size-3 mr-1" />
              {formatTime()}
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <BarChart3 className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bugün Toplam</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalScans}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 dark:border-emerald-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Başarılı</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{successCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 dark:border-amber-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bulunamadı</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{notFoundCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400">
                <TrendingUp className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hata Oranı</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                  %{errorRate}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto -mx-4 px-4">
            <TabsList className="inline-flex w-full sm:w-auto flex-wrap gap-1 bg-slate-100 dark:bg-slate-900 h-auto p-1">
              <TabsTrigger value="search" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <Search className="size-4" />
                <span>Ürün Arama</span>
              </TabsTrigger>
              <TabsTrigger value="receiving" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <ArrowDownToLine className="size-4" />
                <span>Giriş (Alım)</span>
              </TabsTrigger>
              <TabsTrigger value="picking" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <BoxSelect className="size-4" />
                <span>Toplama</span>
              </TabsTrigger>
              <TabsTrigger value="packing" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <PackageCheck className="size-4" />
                <span>Paketleme</span>
              </TabsTrigger>
              <TabsTrigger value="counting" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <ClipboardList className="size-4" />
                <span>Sayım</span>
              </TabsTrigger>
              <TabsTrigger value="transfer" className="flex items-center gap-1.5 text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <ArrowRightLeft className="size-4" />
                <span>Transfer</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── TAB 1: Ürün Arama ── */}
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="size-5 text-emerald-600" />
                  Ürün Arama
                </CardTitle>
                <CardDescription>
                  Barkod okutarak ürün detaylarını, stok bilgilerini ve son hareketleri görüntüleyin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <BarcodeInput
                  value={searchBarcode}
                  onChange={setSearchBarcode}
                  placeholder="Ürün barkodunu girin..."
                  onSubmit={handleSearch}
                  autoFocus
                />
                {searchedProduct && (
                  <>
                    <ProductInfoCard product={searchedProduct} />
                    <Card className="border-slate-200 dark:border-slate-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <History className="size-4 text-slate-500" />
                          Son Hareketler
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {[
                            { date: "14 Oca 2025", action: "Giriş", qty: "+10 adet", user: "Ahmet Y." },
                            { date: "12 Oca 2025", action: "Toplama", qty: "-2 adet", user: "Fatma K." },
                            { date: "10 Oca 2025", action: "Sayım", qty: "45 adet (uyumlu)", user: "Mehmet A." },
                            { date: "08 Oca 2025", action: "Transfer", qty: "-5 adet → Depo C", user: "Ali D." },
                          ].map((m, i) => (
                            <div key={i} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                              <div className="flex items-center gap-3">
                                <span className="text-muted-foreground text-xs">{m.date}</span>
                                <Badge variant="outline" className="text-xs">{m.action}</Badge>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{m.qty}</span>
                                <span className="text-xs text-muted-foreground">{m.user}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
                {searchedProduct === null && scanHistory.some((s) => s.operationType === "Arama") && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="size-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Ürün bulunamadı. Lütfen barkodu kontrol edin.</p>
                  </div>
                )}
                <RecentScans
                  scans={scanHistory.filter((s) => s.operationType === "Arama")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 2: Giriş (Alım) ── */}
          <TabsContent value="receiving">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownToLine className="size-5 text-emerald-600" />
                  Giriş (Alım)
                </CardTitle>
                <CardDescription>
                  Teslim alınan ürünleri barkod okutarak sisteme giriş yapın. Depo ve raf seçimi zorunludur.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <BarcodeInput
                  value={receivingBarcode}
                  onChange={setReceivingBarcode}
                  placeholder="Giriş yapılacak ürün barkodu..."
                  onSubmit={handleReceiving}
                />
                {receivingProduct && (
                  <>
                    <ProductInfoCard product={receivingProduct} />
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Miktar
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={receiveQty}
                          onChange={(e) => setReceiveQty(e.target.value)}
                          placeholder="Adet girin..."
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Depo
                        </label>
                        <Select value={receiveWarehouse} onValueChange={(v) => { setReceiveWarehouse(v); setReceiveBin(""); }}>
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder="Depo seçin..." />
                          </SelectTrigger>
                          <SelectContent>
                            {WAREHOUSES.map((w) => (
                              <SelectItem key={w} value={w}>{w}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Raf / Lokasyon
                        </label>
                        <Select value={receiveBin} onValueChange={setReceiveBin}>
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder="Raf seçin..." />
                          </SelectTrigger>
                          <SelectContent>
                            {(BINS_BY_WAREHOUSE[receiveWarehouse] || []).map((b) => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      onClick={confirmReceiving}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      <CheckCircle2 className="size-4 mr-2" />
                      Girişi Onayla
                    </Button>
                  </>
                )}
                {receivingLog.length > 0 && (
                  <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Archive className="size-4 text-slate-500" />
                        Giriş Kayıtları ({receivingLog.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="max-h-48">
                        <div className="space-y-2">
                          {receivingLog.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-2 text-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                <span className="font-medium truncate">{item.productName}</span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-xs text-muted-foreground">{item.warehouse}/{item.bin}</span>
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                                  {item.quantity} adet
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
                <RecentScans
                  scans={scanHistory.filter((s) => s.operationType === "Giriş")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 3: Toplama ── */}
          <TabsContent value="picking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BoxSelect className="size-5 text-emerald-600" />
                  Toplama
                </CardTitle>
                <CardDescription>
                  Sipariş toplama listesindeki ürünleri barkod okutarak toplayın.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <BarcodeInput
                  value={pickingBarcode}
                  onChange={setPickingBarcode}
                  placeholder="Toplanacak ürün barkodu..."
                  onSubmit={handlePicking}
                />
                {pickingProduct && selectedPickItem && (
                  <>
                    <ProductInfoCard product={pickingProduct} />
                    <Card className="border-slate-200 dark:border-slate-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <ClipboardList className="size-4 text-slate-500" />
                          Sipariş: {selectedPickItem.orderId}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Beklenen: {selectedPickItem.quantity} adet &middot; Lokasyon: {selectedPickItem.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{selectedPickItem.productName}</p>
                            <p className="text-xs text-muted-foreground">SKU: {selectedPickItem.sku}</p>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            Eşleşme ✓
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button
                          onClick={confirmPick}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold w-full sm:w-auto"
                        >
                          <CheckCircle2 className="size-4 mr-2" />
                          Toplamayı Onayla
                        </Button>
                      </CardFooter>
                    </Card>
                  </>
                )}

                {/* Pick list table */}
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Layers className="size-4 text-slate-500" />
                      Aktif Toplama Listesi
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {pickList.filter((p) => p.picked).length} / {pickList.length} tamamlandı
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={(pickList.filter((p) => p.picked).length / pickList.length) * 100}
                      className="mb-3 h-2 [&_[data-slot=progress-indicator]]:bg-emerald-500"
                    />
                    <ScrollArea className="max-h-64">
                      <div className="space-y-2">
                        {pickList.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                              item.picked
                                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900"
                                : "bg-white dark:bg-slate-950"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {item.picked ? (
                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                              ) : (
                                <div className="size-4 rounded-full border-2 border-slate-300 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className={`font-medium truncate ${item.picked ? "line-through text-muted-foreground" : ""}`}>
                                  {item.productName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.orderId} &middot; {item.location} &middot; {item.quantity} adet
                                </p>
                              </div>
                            </div>
                            {item.picked && (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs shrink-0">
                                Toplandı
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
                <RecentScans
                  scans={scanHistory.filter((s) => s.operationType === "Toplama")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 4: Paketleme ── */}
          <TabsContent value="packing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackageCheck className="size-5 text-emerald-600" />
                  Paketleme
                </CardTitle>
                <CardDescription>
                  Toplanan ürünleri doğrulayın, ağırlık kontrolü yapın ve kargo etiketi oluşturun.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <BarcodeInput
                  value={packingBarcode}
                  onChange={setPackingBarcode}
                  placeholder="Paketlenecek ürün barkodu..."
                  onSubmit={handlePacking}
                />
                {packingProduct && (
                  <ProductInfoCard product={packingProduct} />
                )}

                {/* Pack list */}
                <Card className="border-slate-200 dark:border-slate-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Package className="size-4 text-slate-500" />
                      Paket Listesi — SIP-2025-01482
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {packList.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                            item.verified
                              ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900"
                              : "bg-white dark:bg-slate-950"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {item.verified ? (
                              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                            ) : (
                              <div className="size-4 rounded-full border-2 border-slate-300 shrink-0" />
                            )}
                            <span className="font-medium truncate">{item.productName}</span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <Badge variant="outline" className="text-xs">
                              <Scale className="size-3 mr-1" />
                              {item.weight} kg
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.quantity} adet</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-3 sm:flex-row pt-0">
                    <div className="flex-1 w-full">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Tahmini Ağırlık (kg)
                      </label>
                      <Input
                        type="number"
                        value={packWeight}
                        onChange={(e) => setPackWeight(e.target.value)}
                        placeholder="Paket ağırlığını girin..."
                        className="h-11 mt-1"
                      />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto sm:pt-5">
                      <Button
                        onClick={confirmPacking}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex-1 sm:flex-none"
                      >
                        <CheckCircle2 className="size-4 mr-2" />
                        Doğrula
                      </Button>
                      <Button
                        variant="outline"
                        disabled={!packList.every((p) => p.verified)}
                        className="flex-1 sm:flex-none"
                      >
                        <Printer className="size-4 mr-2" />
                        Etiket Yazdır
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
                <RecentScans
                  scans={scanHistory.filter((s) => s.operationType === "Paketleme")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 5: Sayım ── */}
          <TabsContent value="counting">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="size-5 text-emerald-600" />
                  Sayım
                </CardTitle>
                <CardDescription>
                  Ürün barkodunu okutarak fiziksel stok sayımı yapın. Sistem stoku ile farklar otomatik hesaplanır.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <BarcodeInput
                  value={countingBarcode}
                  onChange={setCountingBarcode}
                  placeholder="Sayılacak ürün barkodu..."
                  onSubmit={handleCounting}
                />
                {countingProduct && (
                  <>
                    <ProductInfoCard product={countingProduct} />
                    <Card className={`border ${countSaved ? "border-emerald-200 dark:border-emerald-900" : "border-slate-200 dark:border-slate-800"}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Stok Karşılaştırması</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="rounded-lg bg-muted/50 p-3">
                            <p className="text-xs text-muted-foreground mb-1">Sistem Stoku</p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-200">
                              {countingProduct.stock}
                            </p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-3">
                            <p className="text-xs text-muted-foreground mb-1">Sayılan Stok</p>
                            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                              {countedQty || "—"}
                            </p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-3">
                            <p className="text-xs text-muted-foreground mb-1">Fark</p>
                            {countedQty && (
                              <p
                                className={`text-xl font-bold ${
                                  parseInt(countedQty, 10) === countingProduct.stock
                                    ? "text-emerald-600"
                                    : parseInt(countedQty, 10) > countingProduct.stock
                                    ? "text-blue-600"
                                    : "text-red-600"
                                }`}
                              >
                                {parseInt(countedQty, 10) - countingProduct.stock > 0 ? "+" : ""}
                                {parseInt(countedQty, 10) - countingProduct.stock}
                              </p>
                            )}
                            {!countedQty && <p className="text-xl font-bold text-muted-foreground">—</p>}
                          </div>
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Sayılan Miktar
                            </label>
                            <Input
                              type="number"
                              value={countedQty}
                              onChange={(e) => { setCountedQty(e.target.value); setCountSaved(false); }}
                              placeholder="Fiziksel sayımı girin..."
                              className="h-11 mt-1"
                              disabled={countSaved}
                            />
                          </div>
                          <div className="sm:pt-5">
                            <Button
                              onClick={saveCount}
                              disabled={countSaved || !countedQty}
                              className={`h-11 font-semibold w-full sm:w-auto ${
                                countSaved
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              }`}
                            >
                              {countSaved ? (
                                <>
                                  <CheckCircle2 className="size-4 mr-2" />
                                  Kaydedildi
                                </>
                              ) : (
                                <>
                                  <Save className="size-4 mr-2" />
                                  Sayımı Kaydet
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
                <RecentScans
                  scans={scanHistory.filter((s) => s.operationType === "Sayım")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── TAB 6: Transfer ── */}
          <TabsContent value="transfer">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="size-5 text-emerald-600" />
                  Transfer
                </CardTitle>
                <CardDescription>
                  Ürünleri bir depodan başka bir depoya veya rafta transfer edin. Kaynak ve hedef farklı olmalıdır.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <BarcodeInput
                  value={transferBarcode}
                  onChange={setTransferBarcode}
                  placeholder="Transfer edilecek ürün barkodu..."
                  onSubmit={handleTransfer}
                />
                {transferProduct && (
                  <>
                    <ProductInfoCard product={transferProduct} />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          <Building2 className="inline size-3.5 mr-1 text-slate-400" />
                          Kaynak Depo
                        </label>
                        <Select value={transferFrom} onValueChange={(v) => { setTransferFrom(v); }}>
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder="Kaynak depo..." />
                          </SelectTrigger>
                          <SelectContent>
                            {WAREHOUSES.map((w) => (
                              <SelectItem key={w} value={w}>{w}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          <Building2 className="inline size-3.5 mr-1 text-slate-400" />
                          Hedef Depo
                        </label>
                        <Select value={transferTo} onValueChange={setTransferTo}>
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder="Hedef depo..." />
                          </SelectTrigger>
                          <SelectContent>
                            {WAREHOUSES.filter((w) => w !== transferFrom).map((w) => (
                              <SelectItem key={w} value={w}>{w}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Hedef Raf
                        </label>
                        <Select value={undefined} onValueChange={() => {}} disabled={!transferTo}>
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder={transferTo ? "Raf seçin..." : "Önce depo seçin"} />
                          </SelectTrigger>
                          <SelectContent>
                            {(BINS_BY_WAREHOUSE[transferTo] || []).map((b) => (
                              <SelectItem key={b} value={b}>{b}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Miktar (Max: {transferProduct.stock})
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max={transferProduct.stock}
                          value={transferQty}
                          onChange={(e) => setTransferQty(e.target.value)}
                          placeholder="Adet girin..."
                          className="h-11"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={confirmTransfer}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      <ArrowRightLeft className="size-4 mr-2" />
                      Transferi Onayla
                    </Button>
                  </>
                )}
                <RecentScans
                  scans={scanHistory.filter((s) => s.operationType === "Transfer")}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ── Scan History Table ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="size-5 text-emerald-600" />
                  Tarama Geçmişi
                </CardTitle>
                <CardDescription className="mt-1">
                  Bugün yapılan tüm barkod tarama kayıtları
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setScanHistory([]);
                  setSuccessCount(0);
                  setNotFoundCount(0);
                  setErrorCount(0);
                }}
              >
                <RefreshCw className="size-4 mr-1" />
                Temizle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900">
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Zaman</TableHead>
                    <TableHead className="text-xs font-semibold">Barkod</TableHead>
                    <TableHead className="text-xs font-semibold">Ürün</TableHead>
                    <TableHead className="text-xs font-semibold">İşlem Tipi</TableHead>
                    <TableHead className="text-xs font-semibold hidden md:table-cell">Depo</TableHead>
                    <TableHead className="text-xs font-semibold hidden lg:table-cell">Raf</TableHead>
                    <TableHead className="text-xs font-semibold">Miktar</TableHead>
                    <TableHead className="text-xs font-semibold">Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scanHistory.map((entry) => (
                    <TableRow key={entry.id} className="text-sm">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {entry.time}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium">
                        {entry.barcode}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs">
                        {entry.productName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {entry.operationType}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {entry.warehouse}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {entry.bin}
                      </TableCell>
                      <TableCell className="font-medium text-xs">
                        {entry.quantity > 0 ? entry.quantity : "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={entry.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {scanHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        <History className="size-8 mx-auto mb-2 opacity-20" />
                        Henüz tarama geçmişi bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-slate-950/80 mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© 2025 PazarLogic — Depo Yönetim Sistemi</p>
          <p>WMS v2.4.1 &middot; Son senkronizasyon: {formatTime()}</p>
        </div>
      </footer>

      {/* Notification Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogType === "success" && <CheckCircle2 className="size-5 text-emerald-600" />}
              {dialogType === "error" && <XCircle className="size-5 text-red-600" />}
              {dialogType === "warning" && <AlertTriangle className="size-5 text-amber-600" />}
              {dialogTitle}
            </DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setDialogOpen(false)}
              className={
                dialogType === "success"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : dialogType === "warning"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              Tamam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
