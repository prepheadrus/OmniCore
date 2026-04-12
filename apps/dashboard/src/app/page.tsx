import { Card, CardContent, CardHeader, CardTitle } from "@omnicore/ui/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@omnicore/ui/components/ui/table";
import { Package, DollarSign } from "lucide-react";
import { Chatbox } from "../components/chatbox";

// The API endpoint would normally be fetched from an environment variable or config
const API_URL = "http://localhost:3000/api";

async function getDashboardData() {
  try {
    const [summaryRes, productsRes] = await Promise.all([
      fetch(`${API_URL}/dashboard/summary`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/dashboard/products`, { next: { revalidate: 60 } })
    ]);

    if (!summaryRes.ok || !productsRes.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    const summary = await summaryRes.json();
    const products = await productsRes.json();

    return { summary, products };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      summary: { productsCount: 0, totalRevenue: 0, currency: "TRY" },
      products: []
    };
  }
}

export default async function Index() {
  const { summary, products } = await getDashboardData();

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  };
  const formattedDate = today.toLocaleDateString('tr-TR', dateOptions);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-8 relative min-h-screen">
      {/* 1. Karşılama Alanı */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hoş Geldiniz, Demo User</h1>
          <p className="text-slate-500 mt-1.5 font-medium">{formattedDate}</p>
        </div>
      </div>

      {/* 2. Özet Metrik Kartları (Top Cards) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Ciro
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: summary.currency || 'TRY' }).format(summary.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tüm zamanların toplam cirosu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif Ürünler
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.productsCount}</div>
            <p className="text-xs text-muted-foreground">
              Sistemde kayıtlı toplam ürün sayısı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Ürünler Tablosu (Data Table) */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4">Son Eklenen Ürünler</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Ürün Adı</TableHead>
                <TableHead className="text-right">Fiyat</TableHead>
                <TableHead className="text-right">Stok</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products && products.length > 0 ? (
                products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.sku}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: product.currency || 'TRY' }).format(product.price)}
                    </TableCell>
                    <TableCell className="text-right">{product.stockQuantity}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Henüz ürün bulunmuyor.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Chatbox Bileşeni */}
      <Chatbox />
    </div>
  );
}
