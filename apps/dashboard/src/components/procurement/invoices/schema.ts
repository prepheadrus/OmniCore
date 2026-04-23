import { z } from "zod";

// Helper to handle empty strings returning undefined so they trigger 'required' errors if needed.
const emptyStringToUndefined = (val: unknown) => {
  if (val === "" || val === null || val === undefined) return undefined;
  return Number(val);
};

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Ürün adı zorunludur"),
  quantity: z.preprocess(
    emptyStringToUndefined,
    z.number({ required_error: "Miktar zorunludur", invalid_type_error: "Geçerli bir miktar girin" }).min(0.01, "Miktar 0'dan büyük olmalıdır")
  ),
  unit: z.string().default("Adet"),
  unitPrice: z.preprocess(
    emptyStringToUndefined,
    z.number({ required_error: "Birim fiyat zorunludur", invalid_type_error: "Geçerli bir fiyat girin" }).min(0, "Fiyat 0'dan küçük olamaz")
  ),
  discountPercent: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().min(0).max(100).default(0)
  ),
  totalAmount: z.preprocess(
    emptyStringToUndefined,
    z.number({ required_error: "Tutar zorunludur" }).min(0)
  ),
  isMatched: z.boolean().default(false),
  matchedSku: z.string().optional(),
});

export const invoiceFormSchema = z.object({
  supplierId: z.string().min(1, "Tedarikçi seçimi zorunludur"),
  documentNo: z.string().min(1, "Belge no zorunludur"),
  date: z.string().min(1, "Tarih zorunludur"),
  dueDate: z.string().optional().or(z.literal('')),
  type: z.enum(["E_INVOICE", "E_ARCHIVE"]).default("E_INVOICE"),
  currency: z.string().default("TRY"),
  exchangeRate: z.preprocess(
    emptyStringToUndefined,
    z.number({ required_error: "Kur zorunludur" }).min(0.0001, "Kur 0'dan büyük olmalıdır").default(1)
  ),
  items: z.array(invoiceItemSchema).min(1, "En az bir kalem ürün eklenmelidir"),

  // Financial Summary
  subTotal: z.preprocess(emptyStringToUndefined, z.number().default(0)),
  generalDiscountPercent: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().min(0).max(100).default(0)
  ),
  generalDiscountAmount: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().default(0)
  ),
  taxAmount: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().default(0)
  ),
  roundingDifference: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().default(0)
  ),
  grandTotal: z.preprocess(
    emptyStringToUndefined,
    z.number({ required_error: "Genel toplam hesaplanamadı" }).min(0)
  ),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
