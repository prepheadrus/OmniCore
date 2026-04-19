"use client"

import * as React from "react"
import { Plus, Trash2, Search, ChevronsUpDown, Package, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useChannel } from "../../contexts/ChannelContext"
import { Product } from "./columns"

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
import { Separator } from "@omnicore/ui/components/ui/separator"
import { ScrollArea } from "@omnicore/ui/components/ui/scroll-area"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@omnicore/ui/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@omnicore/ui/components/ui/popover"
import { cn } from "@omnicore/ui/lib/utils"

interface BundleComponent {
  productId: string
  name: string
  sku: string
  quantity: number
  availableStock: number
}

interface BundleFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingProducts: Product[]
  onSuccess: (newBundle: Product) => void
}

export function BundleForm({ open, onOpenChange, existingProducts, onSuccess }: BundleFormProps) {
  const { selectedChannelId, availableChannels } = useChannel()

  const [name, setName] = React.useState("")
  const [sku, setSku] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [components, setComponents] = React.useState<BundleComponent[]>([])
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({})

  // Flatten products and variants for selection
  const selectableProducts = React.useMemo(() => {
    const flattened: { id: string; name: string; sku: string; stock: number }[] = []

    existingProducts.forEach(p => {
      // Add main product
      flattened.push({ id: p.id, name: p.name, sku: p.sku, stock: p.stock })

      // Add variants if any
      if (p.subRows) {
        p.subRows.forEach(v => {
          flattened.push({ id: v.id, name: `${p.name} - ${v.name}`, sku: v.sku, stock: v.stock })
        })
      }
    })

    return flattened
  }, [existingProducts])

  // Calculate virtual stock (minimum of (component stock / required quantity))
  const virtualStock = React.useMemo(() => {
    if (components.length === 0) return 0

    const capacities = components.map(c => Math.floor(c.availableStock / c.quantity))
    return Math.min(...capacities)
  }, [components])

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    if (!name) newErrors.name = "Paket ismi boş bırakılamaz"
    if (!sku) newErrors.sku = "SKU alanı zorunludur"
    if (!price) newErrors.price = "Fiyat belirtilmelidir"
    if (components.length === 0) newErrors.components = "En az bir alt ürün eklemelisiniz"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error("Lütfen formdaki eksikleri giderin")
      return
    }

    const currentChannel = availableChannels.find(c => c.id === selectedChannelId)
    const channelName = currentChannel ? currentChannel.name : selectedChannelId

    const newBundle: Product = {
      id: `BND-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      name,
      sku,
      price: parseFloat(price) || 0,
      cost: 0,
      margin: 0,
      stock: virtualStock,
      status: "IN_STOCK",
      channels: [channelName],
      subRows: components.map((c, i) => ({
        id: `${sku}-ITEM-${i}`,
        name: c.name,
        sku: c.sku,
        price: 0,
        cost: 0,
        margin: 0,
        stock: c.quantity,
        status: "IN_STOCK",
        channels: [channelName],
      }))
    }

    // Mock success
    console.log("Yeni Paket Oluşturuldu:", newBundle)
    toast.success("Paket başarıyla oluşturuldu", {
      description: `${name} kataloğunuza eklendi.`
    })

    onSuccess(newBundle)
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setName("")
    setSku("")
    setPrice("")
    setComponents([])
    setErrors({})
  }

  const addComponent = (product: { id: string; name: string; sku: string; stock: number }) => {
    if (components.some(c => c.productId === product.id)) {
      toast.info("Bu ürün zaten reçetede mevcut")
      return
    }

    setComponents([...components, {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      quantity: 1,
      availableStock: product.stock
    }])

    if (errors.components) {
        setErrors(prev => {
            const next = { ...prev };
            delete next.components;
            return next;
        });
    }
  }

  const updateComponentQuantity = (id: string, qty: number) => {
    setComponents(components.map(c =>
      c.productId === id ? { ...c, quantity: Math.max(1, qty) } : c
    ))
  }

  const removeComponent = (id: string) => {
    setComponents(components.filter(c => c.productId !== id))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] p-0 flex flex-col h-full bg-white border-l shadow-2xl">
        <SheetHeader className="p-6 border-b bg-slate-50/50">
          <SheetTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            Yeni Paket/Set Oluştur
          </SheetTitle>
          <SheetDescription className="text-slate-500 font-medium">
            Mevcut ürünleri birleştirerek sanal bir set oluşturun. Stok otomatik hesaplanacaktır.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <form id="bundle-form" onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Temel Bilgiler Bölümü */}
            <div className="space-y-4">
               <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Genel Bilgiler</h3>

               <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-medium">Paket İsmi</Label>
                    <Input
                      id="name"
                      placeholder="Örn: Profesyonel Bakım Seti"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={cn("bg-white", errors.name && "border-amber-300 bg-amber-50/30 focus-visible:ring-amber-200")}
                    />
                    {errors.name && (
                        <p className="text-[13px] text-amber-700 flex items-center gap-1 mt-1 font-medium" style={{ color: 'oklch(0.55 0.15 45)' }}>
                            <AlertCircle className="h-3.5 w-3.5" />
                            {errors.name}
                        </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku" className="text-slate-700 font-medium">SKU</Label>
                      <Input
                        id="sku"
                        placeholder="SET-001"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className={cn("bg-white", errors.sku && "border-amber-300 bg-amber-50/30")}
                      />
                      {errors.sku && <p className="text-[12px] text-amber-700 font-medium mt-1">{errors.sku}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-slate-700 font-medium">Fiyat (₺)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className={cn("bg-white", errors.price && "border-amber-300 bg-amber-50/30")}
                      />
                      {errors.price && <p className="text-[12px] text-amber-700 font-medium mt-1">{errors.price}</p>}
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-indigo-700 uppercase tracking-tight">Sanal Stok</p>
                        <p className="text-sm text-indigo-600 font-medium mt-0.5">Alt bileşenlere göre hesaplanır</p>
                    </div>
                    <Badge variant="secondary" className="bg-white text-indigo-700 border-indigo-200 text-lg px-3 py-1 font-bold">
                        {virtualStock}
                    </Badge>
                  </div>
               </div>
            </div>

            <Separator className="bg-slate-100" />

            {/* Reçete / BOM Bölümü */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Ürün Reçetesi (BOM)</h3>
                    {components.length > 0 && (
                        <Badge variant="outline" className="text-[11px] font-bold bg-slate-50">
                            {components.length} Ürün
                        </Badge>
                    )}
               </div>

               {/* Alt Ürün Seçici (Combobox) */}
               <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Alt Ürün Ekle</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between bg-white text-slate-500 font-normal hover:bg-slate-50 border-dashed"
                        >
                            <span className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Ürün veya varyant ara...
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[452px] p-0" align="start">
                        <Command className="bg-white border shadow-xl">
                            <CommandInput placeholder="Ürün ismi veya SKU yazın..." className="h-10" />
                            <CommandList>
                                <CommandEmpty>Ürün bulunamadı.</CommandEmpty>
                                <CommandGroup>
                                    {selectableProducts.map((p) => {
                                        const isAlreadyAdded = components.some(c => c.productId === p.id);
                                        return (
                                        <CommandItem
                                            key={p.id}
                                            value={`${p.name} ${p.sku}`}
                                            onSelect={() => addComponent(p)}
                                            disabled={isAlreadyAdded}
                                            className="flex items-center justify-between p-2 cursor-pointer hover:bg-indigo-50"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900">{p.name}</span>
                                                <span className="text-xs text-slate-500">SKU: {p.sku} • Stok: {p.stock}</span>
                                            </div>
                                            <Plus className="h-4 w-4 text-indigo-600" />
                                        </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                  </Popover>
               </div>

               {/* Eklenen Bileşenler Listesi */}
               <div className="space-y-3 mt-4">
                  {components.length === 0 ? (
                      <div className="py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-400 gap-3 bg-slate-50/30">
                          <Package className="h-10 w-10 opacity-20" />
                          <p className="text-sm font-medium">Henüz ürün eklenmedi</p>
                      </div>
                  ) : (
                      components.map((item) => (
                        <div key={item.productId} className="group p-4 bg-white border rounded-xl shadow-sm hover:border-indigo-200 transition-all">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-slate-900 leading-none">{item.name}</p>
                                    <p className="text-xs text-slate-500 font-medium">SKU: {item.sku}</p>
                                    <p className="text-[11px] font-semibold text-emerald-600 mt-1 uppercase">Mevcut Stok: {item.availableStock}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
                                    onClick={() => removeComponent(item.productId)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="mt-4 flex items-center justify-end gap-3 border-t pt-3">
                                <Label className="text-xs font-bold text-slate-500">PAKET İÇİ ADET:</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateComponentQuantity(item.productId, parseInt(e.target.value) || 1)}
                                    className="h-8 w-20 text-center font-bold bg-slate-50"
                                />
                            </div>
                        </div>
                      ))
                  )}
                  {errors.components && (
                       <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-center gap-2 text-amber-800 text-sm font-medium">
                           <AlertCircle className="h-4 w-4" />
                           {errors.components}
                       </div>
                  )}
               </div>
            </div>
          </form>
        </ScrollArea>

        <SheetFooter className="p-6 border-t bg-slate-50/50 mt-auto">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-600 hover:bg-slate-200/50 font-semibold">
            İptal
          </Button>
          <Button
            type="submit"
            form="bundle-form"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 font-bold px-8"
          >
            Paketi Kaydet
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
