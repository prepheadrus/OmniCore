"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useChannel } from "../../contexts/ChannelContext"
import { Plus, Trash2, Sparkles } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@omnicore/ui/components/ui/sheet"
import { Button } from "@omnicore/ui/components/ui/button"
import { Input } from "@omnicore/ui/components/ui/input"
import { Label } from "@omnicore/ui/components/ui/label"
import { Badge } from "@omnicore/ui/components/ui/badge"
import { ScrollArea } from "@omnicore/ui/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@omnicore/ui/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@omnicore/ui/components/ui/select"
import { Switch } from "@omnicore/ui/components/ui/switch"

// --- SCHEMAS ---
const channelSchema = z.object({
  channelId: z.string(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
  isActive: z.boolean()
})

const bundleItemSchema = z.object({
  variantId: z.string(),
  name: z.string(),
  quantity: z.coerce.number().min(1)
})

const productFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Ürün adı en az 2 karakter olmalıdır." }),
  description: z.string().optional(),
  brand: z.string().optional(),
  categoryId: z.string().optional(),
  taxRateId: z.string().optional(),
  costPrice: z.coerce.number().min(0),
  channels: z.array(channelSchema),
  bundleItems: z.array(bundleItemSchema).optional()
})

type ProductFormValues = z.infer<typeof productFormSchema>

// --- MOCK DATA FOR DEMO ---
const MOCK_CATEGORIES = [
  { id: "cat-1", name: "Otomotiv Bakım" },
  { id: "cat-2", name: "Temizlik Malzemeleri" },
  { id: "cat-3", name: "Aksesuarlar" }
]

const MOCK_VARIANTS = [
  { id: "var-1", name: "Oto Şampuanı 1L" },
  { id: "var-2", name: "Oto Şampuanı 5L" },
  { id: "var-3", name: "Fırça Standart" },
  { id: "var-4", name: "Mikrofiber Bez" }
]

const getMockProduct = (id: string): ProductFormValues => {
  return {
    id,
    name: "Örnek Ürün Detayı",
    description: "Bu ürün deep link ile açılmıştır.",
    brand: "Pakbey",
    categoryId: "cat-1",
    taxRateId: "20",
    costPrice: 80.5,
    channels: [
      { channelId: "trendyol", price: 150, stock: 45, isActive: true },
      { channelId: "hepsiburada", price: 160, stock: 45, isActive: true },
      { channelId: "amazon", price: 140, stock: 0, isActive: false }
    ],
    bundleItems: [
      { variantId: "var-1", name: "Oto Şampuanı 1L", quantity: 2 }
    ]
  }
}

export function ProductDetailSheet({
  productId,
  onClose
}: {
  productId: string | null
  onClose: () => void
}) {
  const { selectedChannelId, availableChannels } = useChannel()

  const isOpen = !!productId

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as unknown as import("react-hook-form").Resolver<ProductFormValues>,
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      categoryId: "",
      taxRateId: "20",
      costPrice: 0,
      channels: availableChannels.map(c => ({ channelId: c.id, price: 0, stock: 0, isActive: false })),
      bundleItems: []
    }
  })

  const { fields: channelFields } = useFieldArray({
    control: form.control,
    name: "channels"
  })

  const { fields: bundleFields, append: appendBundle, remove: removeBundle } = useFieldArray({
    control: form.control,
    name: "bundleItems"
  })

  React.useEffect(() => {
    if (productId) {
      const mockData = getMockProduct(productId)
      form.reset(mockData)
    }
  }, [productId, form])

  const handleClose = () => {
    onClose()
  }

  const onSubmit = (data: ProductFormValues) => {
    console.log("Saving product:", data)
    toast.success("Değişiklikler kaydedildi (Simülasyon)", {
      description: `${data.name} başarıyla güncellendi.`,
      className: "bg-[#eef2ff] text-[#4f46e5] border-[#c7d2fe]"
    })
    handleClose()
  }

  const orderedChannelFields = React.useMemo(() => {
    const selectedIdx = channelFields.findIndex(f => f.channelId === selectedChannelId);
    if (selectedIdx > 0) {
      const reordered = [...channelFields];
      const selected = reordered.splice(selectedIdx, 1)[0];
      reordered.unshift(selected);
      return { fields: reordered, originalIndices: [selectedIdx, ...channelFields.map((_, i) => i).filter(i => i !== selectedIdx)] };
    }
    return { fields: channelFields, originalIndices: channelFields.map((_, i) => i) };
  }, [channelFields, selectedChannelId])

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col h-full bg-slate-50 border-l border-slate-200">
        <SheetHeader className="px-6 py-4 border-b border-slate-200 bg-white">
          <SheetTitle className="text-lg font-medium text-slate-800">Ürün Detayı</SheetTitle>
          <SheetDescription className="text-slate-500 text-[13px]">
            {productId} ürününün tüm detaylarını buradan yönetebilirsiniz.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="w-full grid grid-cols-4 bg-slate-200/50 p-1 rounded-md mb-6">
                <TabsTrigger value="general" className="text-[12px] h-7 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Genel Bilgiler</TabsTrigger>
                <TabsTrigger value="price" className="text-[12px] h-7 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Fiyat & Stok</TabsTrigger>
                <TabsTrigger value="bundle" className="text-[12px] h-7 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Paket (BOM)</TabsTrigger>
                <TabsTrigger value="channels" className="text-[12px] h-7 rounded-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Kanallar</TabsTrigger>
              </TabsList>

              {/* GENEL BİLGİLER */}
              <TabsContent value="general" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 mt-0">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[13px] text-slate-700">Ürün Adı</Label>
                    <Input id="name" {...form.register("name")} className="h-8 text-[13px]" />
                    {form.formState.errors.name && <p className="text-red-500 text-[11px]">{form.formState.errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-[13px] text-slate-700">Açıklama</Label>
                    <Input id="description" {...form.register("description")} className="h-8 text-[13px]" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand" className="text-[13px] text-slate-700">Marka</Label>
                      <Input id="brand" {...form.register("brand")} className="h-8 text-[13px]" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRateId" className="text-[13px] text-slate-700">KDV Oranı</Label>
                      <Select
                        value={form.watch("taxRateId")}
                        onValueChange={(val) => form.setValue("taxRateId", val)}
                      >
                        <SelectTrigger className="h-8 text-[13px]">
                          <SelectValue placeholder="KDV Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1%</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                          <SelectItem value="20">20%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-[13px] text-slate-700">Kategori</Label>
                    <div className="flex gap-2 items-start">
                      <div className="flex-1">
                        <Select
                          value={form.watch("categoryId")}
                          onValueChange={(val) => form.setValue("categoryId", val)}
                        >
                          <SelectTrigger className="h-8 text-[13px]">
                            <SelectValue placeholder="Kategori Seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_CATEGORIES.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1.5 min-w-[200px]">
                        <Badge variant="secondary" className="bg-[#eef2ff] text-[#4f46e5] hover:bg-[#eef2ff] border border-[#c7d2fe] text-[10px] py-0.5 flex gap-1 items-center justify-center">
                          <Sparkles className="h-3 w-3" />
                          Jules bu ürünü &apos;Otomotiv Bakım&apos; ile eşleştirdi
                        </Badge>
                        <Button type="button" variant="outline" size="sm" className="h-6 text-[11px] border-[#c7d2fe] text-[#4f46e5] hover:bg-[#eef2ff]" onClick={() => form.setValue("categoryId", "cat-1")}>
                          Öneriyi Onayla
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* FİYAT & STOK */}
              <TabsContent value="price" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 mt-0">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
                  <div className="space-y-2 mb-6 border-b border-slate-100 pb-4">
                     <Label htmlFor="costPrice" className="text-[13px] text-slate-700">Maliyet (Alış Fiyatı)</Label>
                     <div className="relative">
                       <span className="absolute left-2.5 top-1.5 text-slate-500 text-[13px]">₺</span>
                       <Input
                         id="costPrice"
                         type="number"
                         step="0.01"
                         className="h-8 pl-6 text-[13px] max-w-[200px]"
                         {...form.register("costPrice", { valueAsNumber: true })}
                       />
                     </div>
                  </div>

                  <h3 className="text-[13px] font-medium text-slate-800">Kanal Bazlı Fiyat ve Stoklar</h3>
                  <div className="space-y-3">
                    {orderedChannelFields.fields.map((field, orderedIdx) => {
                      const originalIdx = orderedChannelFields.originalIndices[orderedIdx];
                      const channelInfo = availableChannels.find(c => c.id === field.channelId);
                      const isSelected = field.channelId === selectedChannelId;

                      return (
                        <div key={field.id} className={`grid grid-cols-12 gap-3 items-center p-3 rounded-md border ${isSelected ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 bg-slate-50'}`}>
                           <div className="col-span-4 flex items-center gap-2">
                             <span className="text-[13px] font-medium text-slate-700">{channelInfo?.name || field.channelId}</span>
                             {isSelected && <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 text-[9px] px-1 py-0 h-4 border-0">Aktif Seçim</Badge>}
                           </div>
                           <div className="col-span-4 space-y-1">
                             <Label className="text-[10px] text-slate-500 uppercase tracking-wider">Satış Fiyatı (₺)</Label>
                             <Input
                               type="number"
                               step="0.01"
                               className="h-7 text-[13px] bg-white"
                               {...form.register(`channels.${originalIdx}.price`, { valueAsNumber: true })}
                             />
                           </div>
                           <div className="col-span-4 space-y-1">
                             <Label className="text-[10px] text-slate-500 uppercase tracking-wider">Fiziksel Stok</Label>
                             <Input
                               type="number"
                               className="h-7 text-[13px] bg-white"
                               {...form.register(`channels.${originalIdx}.stock`, { valueAsNumber: true })}
                             />
                           </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* PAKET (BUNDLE) */}
              <TabsContent value="bundle" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 mt-0">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-[13px] font-medium text-slate-800">Paket İçeriği (BOM)</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">Bu ürün bir set ise, içeriğindeki alt varyantları buradan ekleyin.</p>
                    </div>
                  </div>

                  {bundleFields.length > 0 ? (
                    <div className="space-y-2">
                      {bundleFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-3 bg-slate-50 p-2 rounded border border-slate-100">
                          <div className="flex-1">
                            <Select
                              value={form.watch(`bundleItems.${index}.variantId`)}
                              onValueChange={(val) => {
                                form.setValue(`bundleItems.${index}.variantId`, val);
                                const vName = MOCK_VARIANTS.find(v => v.id === val)?.name || "";
                                form.setValue(`bundleItems.${index}.name`, vName);
                              }}
                            >
                              <SelectTrigger className="h-7 text-[12px] bg-white">
                                <SelectValue placeholder="Varyant Seçin" />
                              </SelectTrigger>
                              <SelectContent>
                                {MOCK_VARIANTS.map(v => (
                                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="w-24">
                            <Input
                              type="number"
                              className="h-7 text-[12px] bg-white"
                              placeholder="Adet"
                              {...form.register(`bundleItems.${index}.quantity`, { valueAsNumber: true })}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeBundle(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-md">
                       <p className="text-[12px] text-slate-500">Henüz alt ürün eklenmemiş.</p>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-[12px] border-dashed border-slate-300 text-slate-600"
                    onClick={() => appendBundle({ variantId: "", name: "", quantity: 1 })}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Alt Ürün (Varyant) Ekle
                  </Button>
                </div>
              </TabsContent>

              {/* KANALLAR */}
              <TabsContent value="channels" className="space-y-4 focus-visible:outline-none focus-visible:ring-0 mt-0">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-[13px] font-medium text-slate-800 border-b border-slate-100 pb-2">Yayınlanma Durumları</h3>

                  <div className="space-y-3">
                    {channelFields.map((field, index) => {
                      const channelInfo = availableChannels.find(c => c.id === field.channelId);
                      return (
                        <div key={field.id} className="flex items-center justify-between p-3 rounded-md border border-slate-100 bg-slate-50">
                           <div>
                             <p className="text-[13px] font-medium text-slate-700">{channelInfo?.name || field.channelId}</p>
                             <p className="text-[11px] text-slate-500">Bu kanalda satışı aç veya kapat.</p>
                           </div>
                           <div className="flex items-center space-x-2">
                             <Label className="text-[11px] text-slate-500">{form.watch(`channels.${index}.isActive`) ? "Aktif" : "Pasif"}</Label>
                             <Switch
                               checked={form.watch(`channels.${index}.isActive`)}
                               onCheckedChange={(checked) => form.setValue(`channels.${index}.isActive`, checked)}
                             />
                           </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>

            </Tabs>
          </form>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t border-slate-200 bg-white sm:justify-between">
           <Button type="button" variant="outline" onClick={handleClose} className="h-8 text-[13px]">
             İptal
           </Button>
           <Button type="submit" form="product-form" className="h-8 text-[13px] bg-indigo-600 hover:bg-indigo-700 text-white">
             Kaydet
           </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
