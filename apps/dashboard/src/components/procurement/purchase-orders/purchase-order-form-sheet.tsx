"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@omnicore/ui/components/ui/sheet"
import { Button } from "@omnicore/ui/components/ui/button"
import { Input } from "@omnicore/ui/components/ui/input"
import { Label } from "@omnicore/ui/components/ui/label"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { DebouncedCombobox } from "../../../components/shared/debounced-combobox"
import { Controller } from "react-hook-form"

// A simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

const purchaseOrderItemSchema = z.object({
  productVariantId: z.string().min(1, "Varyant seçilmelidir"),
  quantity: z.union([z.string(), z.number()]).transform((val) => Number(val)).refine((val) => val >= 1, { message: "Miktar en az 1 olmalıdır" }),
  unitCost: z.union([z.string(), z.number()]).transform((val) => Number(val)).refine((val) => val >= 0, { message: "Birim maliyet 0'dan küçük olamaz" }),
})

const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Tedarikçi seçilmelidir"),
  items: z.array(purchaseOrderItemSchema).min(1, "En az bir kalem eklemelisiniz"),
})

type PurchaseOrderFormValues = z.input<typeof purchaseOrderSchema>

export function PurchaseOrderFormSheet() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<Array<Record<string, unknown>>>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [variants, setVariants] = useState<Array<Record<string, unknown>>>([])

  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const router = useRouter()
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplierId: "",
      items: [{ productVariantId: "", quantity: 1, unitCost: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  })

  const watchItems = form.watch("items")
  const totalAmount = useMemo(() => {
    return watchItems.reduce((acc, item) => {
      const q = Number(item.quantity) || 0
      const c = Number(item.unitCost) || 0
      return acc + (q * c)
    }, 0)
  }, [watchItems])

  // Fetch suppliers
  useEffect(() => {
    if (open) {
      fetch("/api/suppliers")
        .then(res => res.json())
        .then(data => setSuppliers(Array.isArray(data) ? data : []))
        .catch(console.error)
    }
  }, [open])

  // Fetch variants using debounced search
  useEffect(() => {
        const fetchVariants = async () => {
      try {
        const url = debouncedSearchTerm
          ? `/api/products?q=${encodeURIComponent(debouncedSearchTerm)}`
          : `/api/products`

        const res = await fetch(url)
        const data = await res.json()

        if (data && data.data) {
          // Flatten products variants
          const allVariants = data.data.flatMap((p: { name: string, variants: Record<string, unknown>[] }) =>
            p.variants.map((v: Record<string, unknown>) => ({
              ...v,
              productName: p.name
            }))
          )
          setVariants(allVariants)
        }
      } catch (error) {
        console.error(error)
      }
    }

    fetchVariants()
  }, [debouncedSearchTerm])

  async function onSubmit(data: PurchaseOrderFormValues) {
    try {
      setIsLoading(true)
      const response = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
        }),
      })

      if (!response.ok) {
        throw new Error("Alım faturası oluşturulamadı")
      }

      toast.success("Alım faturası başarıyla oluşturuldu")
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (error) {
      toast.error("Bir hata oluştu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
          Yeni Alım Faturası
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Yeni Alım Faturası</SheetTitle>
          <SheetDescription>
            Sisteme yeni bir alım faturası işleyin. Varyantları arayarak kalem ekleyebilirsiniz.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6 pb-20">
          <div className="space-y-2">
            <Label htmlFor="supplierId">Tedarikçi *</Label>
            <select
              id="supplierId"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
              {...form.register("supplierId")}
            >
              <option value="">Seçiniz...</option>
              {suppliers.map((s: Record<string, unknown>) => (
                <option key={String(s.id)} value={String(s.id)}>{String(s.name)}</option>
              ))}
            </select>
            {form.formState.errors.supplierId && (
              <p className="text-sm text-[oklch(0.55_0.15_45)]">{form.formState.errors.supplierId.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Fatura Kalemleri</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productVariantId: "", quantity: 1, unitCost: 0 })}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-2" />
                Kalem Ekle
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border border-slate-200 rounded-md space-y-4 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium text-slate-700">Kalem {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Varyant Seçimi (SKU Ara)</Label>
                    <Controller
                      name={`items.${index}.productVariantId` as const}
                      control={form.control}
                      render={({ field }) => (
                        <DebouncedCombobox
                          value={field.value}
                          onValueChange={field.onChange}
                          onSearch={setSearchTerm}
                          options={variants.map((v: Record<string, unknown>) => ({
                            value: String(v.id),
                            label: `${String(v.productName)} - ${String(v.sku)}`,
                          }))}
                          placeholder="Varyant seçin..."
                          searchPlaceholder="Varyant ara (isim, SKU)..."
                        />
                      )}
                  />
                  {form.formState.errors.items?.[index]?.productVariantId && (
                      <p className="text-sm text-[oklch(0.55_0.15_45)]">
                        {form.formState.errors.items[index]?.productVariantId?.message}
                      </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Miktar</Label>
                    <Input
                      type="number"
                      min="1"
                      {...form.register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Birim Maliyet (₺)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register(`items.${index}.unitCost` as const, { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>
            ))}
            {form.formState.errors.items?.root && (
              <p className="text-sm text-[oklch(0.55_0.15_45)]">{form.formState.errors.items.root.message}</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-medium text-slate-700">Genel Toplam:</span>
              <span className="text-2xl font-bold text-slate-900">
                {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(totalAmount)}
              </span>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                {isLoading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
