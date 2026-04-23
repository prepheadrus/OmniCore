"use client"

import React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@omnicore/ui/components/ui/tabs"
import { Input } from "@omnicore/ui/components/ui/input"
import { Label } from "@omnicore/ui/components/ui/label"
import { Button } from "@omnicore/ui/components/ui/button"
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@omnicore/ui/components/ui/select"
import { Checkbox } from "@omnicore/ui/components/ui/checkbox"

const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Varyant adı zorunludur"),
  sku: z.string().min(1, "SKU zorunludur"),
  color: z.string().optional(),
  size: z.string().optional(),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0),
  stock: z.coerce.number().min(0).default(0),
  desi: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().min(0).optional(),
  barcode: z.string().optional(),
})

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Ürün adı zorunludur"),
  category: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["IN_STOCK", "OUT_OF_STOCK", "INACTIVE"]).default("INACTIVE"),
  channels: z.array(z.string()).default([]),
  variants: z.array(variantSchema).default([]),
})

type ProductFormValues = z.infer<typeof productSchema>

export interface ProductFormProps {
  initialData?: Partial<ProductFormValues>
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter()

  const defaultValues: Partial<ProductFormValues> = initialData || {
    name: "",
    category: "",
    brand: "",
    description: "",
    status: "INACTIVE",
    channels: [],
    variants: [
      {
        name: "Varsayılan",
        sku: "",
        price: 0,
        cost: 0,
        stock: 0,
      }
    ],
  }

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    name: "variants",
    control: form.control,
  })

  const onSubmit = (data: ProductFormValues) => {
    console.log("Form data:", data)
    toast.success("Ürün başarıyla kaydedildi")
    router.push("/products")
  }

  const inputStyle = "bg-[#ffffff] border-[#c6c6c6]/20 focus-visible:border-[#000000] focus-visible:ring-0 text-[13px] h-9"
  const labelStyle = "text-[#474747] text-[12px] font-medium"

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-[#f7f9fb] min-h-[calc(100vh-64px)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/products">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#e6e8ea]">
              <ArrowLeft className="h-4 w-4 text-[#191c1e]" />
            </Button>
          </Link>
          <h2 className="text-[1.5rem] font-medium tracking-tight text-[#191c1e] tracking-[-0.02em]">
            {initialData ? "Ürünü Düzenle" : "Yeni Ürün"}
          </h2>
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          className="bg-[#000000] hover:bg-[#333b50] text-[#dae2fd] h-8 px-4 rounded-md text-[13px] transition-colors"
        >
          <Save className="mr-2 h-4 w-4" /> {initialData ? "Değişiklikleri Kaydet" : "Ürünü Oluştur"}
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="general" className="w-full space-y-6">
          <TabsList className="bg-transparent border-b border-[#c6c6c6]/20 w-full justify-start rounded-none h-auto p-0">
            <TabsTrigger
              value="general"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#000000] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[13px] py-2 px-4"
            >
              Genel Bilgiler
            </TabsTrigger>
            <TabsTrigger
              value="variants"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#000000] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[13px] py-2 px-4"
            >
              Varyant & Fiyatlandırma
            </TabsTrigger>
            <TabsTrigger
              value="logistics"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#000000] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[13px] py-2 px-4"
            >
              Lojistik & Kargo
            </TabsTrigger>
             <TabsTrigger
              value="channels"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#000000] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-[13px] py-2 px-4"
            >
              Kanallar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="bg-[#f2f4f6] p-6 rounded-[6px] space-y-6 mt-0">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className={labelStyle}>Ürün Adı *</Label>
                <Input id="name" {...form.register("name")} className={inputStyle} />
                {form.formState.errors.name && <p className="text-[#ba1a1a] text-[11px]">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className={labelStyle}>Durum</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value: any) => form.setValue("status", value)}
                >
                  <SelectTrigger className={inputStyle}>
                    <SelectValue placeholder="Durum seç" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#ffffff] border-[#c6c6c6]/20">
                    <SelectItem value="IN_STOCK" className="text-[13px]">Aktif</SelectItem>
                    <SelectItem value="OUT_OF_STOCK" className="text-[13px]">Tükendi</SelectItem>
                    <SelectItem value="INACTIVE" className="text-[13px]">Taslak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className={labelStyle}>Kategori</Label>
                <Input id="category" {...form.register("category")} className={inputStyle} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand" className={labelStyle}>Marka</Label>
                <Input id="brand" {...form.register("brand")} className={inputStyle} />
              </div>
               <div className="space-y-2 col-span-2">
                <Label htmlFor="description" className={labelStyle}>Açıklama</Label>
                <textarea
                  id="description"
                  {...form.register("description")}
                  className="flex min-h-[120px] w-full rounded-[6px] border border-[#c6c6c6]/20 bg-[#ffffff] px-3 py-2 text-[13px] shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#000000] focus-visible:border-[#000000]"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="variants" className="space-y-6 mt-0">
             <div className="flex justify-end">
               <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ name: "", sku: "", price: 0, cost: 0, stock: 0 })}
                  className="bg-[#ffffff] border-[#c6c6c6]/20 text-[#191c1e] hover:bg-[#f2f4f6] h-8 text-[12px] rounded-[6px]"
                >
                  <Plus className="mr-2 h-3 w-3" /> Varyant Ekle
                </Button>
             </div>

             <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="bg-[#ffffff] p-5 rounded-[6px] border border-[#c6c6c6]/20 relative group">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="absolute top-2 right-2 h-7 w-7 text-[#c6c6c6] hover:text-[#ba1a1a] hover:bg-[#ffdad6] opacity-0 group-hover:opacity-100 transition-opacity rounded-[6px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label className={labelStyle}>Varyant Adı *</Label>
                      <Input {...form.register(`variants.${index}.name`)} className={inputStyle} placeholder="Örn: 500ml, Kırmızı/M" />
                      {form.formState.errors.variants?.[index]?.name && <p className="text-[#ba1a1a] text-[11px]">{form.formState.errors.variants[index]?.name?.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className={labelStyle}>SKU *</Label>
                      <Input {...form.register(`variants.${index}.sku`)} className={inputStyle} />
                      {form.formState.errors.variants?.[index]?.sku && <p className="text-[#ba1a1a] text-[11px]">{form.formState.errors.variants[index]?.sku?.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className={labelStyle}>Stok</Label>
                      <Input type="number" {...form.register(`variants.${index}.stock`, { valueAsNumber: true })} className={inputStyle} />
                    </div>
                    <div className="space-y-2">
                      <Label className={labelStyle}>Renk</Label>
                      <Input {...form.register(`variants.${index}.color`)} className={inputStyle} placeholder="Opsiyonel" />
                    </div>
                    <div className="space-y-2">
                      <Label className={labelStyle}>Beden/Ölçü</Label>
                      <Input {...form.register(`variants.${index}.size`)} className={inputStyle} placeholder="Opsiyonel" />
                    </div>
                    <div className="space-y-2">
                      <Label className={labelStyle}>Satış Fiyatı (₺)</Label>
                      <Input type="number" step="0.01" {...form.register(`variants.${index}.price`, { valueAsNumber: true })} className={inputStyle} />
                    </div>
                     <div className="space-y-2">
                      <Label className={labelStyle}>Maliyet (₺)</Label>
                      <Input type="number" step="0.01" {...form.register(`variants.${index}.cost`, { valueAsNumber: true })} className={inputStyle} />
                    </div>
                  </div>
                </div>
              ))}
              {fields.length === 0 && (
                 <div className="text-center py-12 bg-[#ffffff] rounded-[6px] border border-dashed border-[#c6c6c6] text-[#474747] text-[13px]">
                   Henüz varyant eklenmemiş. Varyantsız ürün için en az bir varsayılan kayıt oluşturun.
                 </div>
              )}
             </div>
          </TabsContent>

          <TabsContent value="logistics" className="space-y-4 mt-0">
            {fields.map((field, index) => (
                <div key={field.id} className="bg-[#ffffff] p-5 rounded-[6px] border border-[#c6c6c6]/20">
                   <h4 className="text-[13px] font-medium text-[#191c1e] mb-4 pb-2 border-b border-[#c6c6c6]/20">
                     {form.watch(`variants.${index}.name`) || `Varyant ${index + 1}`} Lojistik Bilgileri
                   </h4>
                   <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className={labelStyle}>Desi</Label>
                        <Input type="number" step="0.1" {...form.register(`variants.${index}.desi`, { valueAsNumber: true })} className={inputStyle} />
                      </div>
                      <div className="space-y-2">
                        <Label className={labelStyle}>Ağırlık (kg)</Label>
                        <Input type="number" step="0.1" {...form.register(`variants.${index}.weight`, { valueAsNumber: true })} className={inputStyle} />
                      </div>
                      <div className="space-y-2">
                        <Label className={labelStyle}>Barkod (EAN/UPC)</Label>
                        <Input {...form.register(`variants.${index}.barcode`)} className={inputStyle} placeholder="Pazar yeri eşleşmesi için" />
                      </div>
                   </div>
                </div>
            ))}
            {fields.length === 0 && (
                 <div className="text-center py-12 bg-[#ffffff] rounded-[6px] border border-dashed border-[#c6c6c6] text-[#474747] text-[13px]">
                   Lojistik bilgilerini girmek için önce varyant eklemelisiniz.
                 </div>
            )}
          </TabsContent>

          <TabsContent value="channels" className="bg-[#f2f4f6] p-6 rounded-[6px] space-y-6 mt-0">
              <div className="space-y-4">
                <h3 className="text-[14px] font-medium text-[#191c1e]">Satışa Açık Kanallar</h3>
                <p className="text-[12px] text-[#474747]">Bu ürünün hangi platformlarda listeleneceğini seçin.</p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  {[
                    { id: "trendyol", label: "Trendyol" },
                    { id: "hepsiburada", label: "Hepsiburada" },
                    { id: "amazon", label: "Amazon TR" },
                    { id: "b2b", label: "B2B Bayi Portalı" },
                  ].map((channel) => {
                     const isChecked = form.watch("channels").includes(channel.id)
                     return (
                      <div key={channel.id} className="flex flex-row items-start space-x-3 space-y-0 rounded-[6px] border border-[#c6c6c6]/20 bg-[#ffffff] p-4">
                        <Checkbox
                          id={`channel-${channel.id}`}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            const current = form.getValues("channels")
                            if (checked) {
                              form.setValue("channels", [...current, channel.id])
                            } else {
                              form.setValue("channels", current.filter(c => c !== channel.id))
                            }
                          }}
                          className="border-[#c6c6c6]/40 data-[state=checked]:bg-[#000000] data-[state=checked]:text-[#ffffff]"
                        />
                        <div className="space-y-1 leading-none">
                          <Label htmlFor={`channel-${channel.id}`} className="text-[13px] font-medium text-[#191c1e] cursor-pointer">
                            {channel.label}
                          </Label>
                        </div>
                      </div>
                     )
                  })}
                </div>
              </div>
          </TabsContent>

        </Tabs>
      </form>
    </div>
  )
}
