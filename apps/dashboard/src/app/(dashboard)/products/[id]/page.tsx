import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@omnicore/ui/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@omnicore/ui/components/ui/card';
import { Input } from '@omnicore/ui/components/ui/input';
import { Label } from '@omnicore/ui/components/ui/label';

export const metadata: Metadata = {
  title: 'Ürün Detayı | Omnicore',
  description: 'Gelişmiş Ürün Detay Sayfası',
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  // In a real application, you would fetch the product data here based on params.id

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ürün Düzenle</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
          <TabsTrigger value="variants">Varyantlar</TabsTrigger>
          <TabsTrigger value="pricing">Fiyatlandırma</TabsTrigger>
          <TabsTrigger value="logistics">Lojistik/Kargo</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genel Ürün Bilgileri</CardTitle>
              <CardDescription>
                Ürünün temel bilgilerini (isim, kategori, marka vb.) buradan güncelleyebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ürün Adı</Label>
                <Input id="name" defaultValue="Örnek Ürün" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Input id="category" defaultValue="Örnek Kategori" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Marka</Label>
                <Input id="brand" defaultValue="Örnek Marka" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Varyantlar</CardTitle>
              <CardDescription>
                Ürüne ait renk, beden, hacim gibi alt seçenekleri yönetin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Varyantları listeleyen tablo veya form buraya gelecek */}
              <div className="rounded-md border p-4">
                 <p className="text-sm text-muted-foreground">Varyant listesi burada görüntülenecektir...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Varyant Fiyatlandırması</CardTitle>
              <CardDescription>
                Her bir varyantın fiyat ve stok bilgilerini ayrı ayrı düzenleyin.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="rounded-md border p-4">
                 <p className="text-sm text-muted-foreground">Varyantlara özel fiyat ve stok listesi...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lojistik ve Kargo Detayları</CardTitle>
              <CardDescription>
                Varyant bazlı desi, ağırlık ve boyut (dimensions) bilgilerini tanımlayın.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <div className="rounded-md border p-4">
                 <p className="text-sm text-muted-foreground">Varyant lojistik formları...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
