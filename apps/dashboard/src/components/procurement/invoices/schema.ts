import { z } from "zod";

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Ürün adı zorunludur"),
  quantity: z.coerce.number().min(0.01, "Miktar 0'dan büyük olmalıdır"),
  unit: z.string().default("Adet"),
  unitPrice: z.coerce.number().min(0, "Fiyat 0'dan küçük olamaz"),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  totalAmount: z.coerce.number().min(0),
  isMatched: z.boolean().default(false),
  matchedSku: z.string().optional(),
});

export const invoiceFormSchema = z.object({
  supplierId: z.string().min(1, "Tedarikçi seçimi zorunludur"),
  documentNo: z.string().min(1, "Belge no zorunludur"),
  date: z.string().min(1, "Tarih zorunludur"),
  dueDate: z.string().optional(),
  currency: z.string().default("TRY"),
  exchangeRate: z.coerce.number().default(1),
  items: z.array(invoiceItemSchema).min(1, "En az bir kalem ürün eklenmelidir"),

  // Financial Summary
  subTotal: z.coerce.number().default(0),
  generalDiscountPercent: z.coerce.number().min(0).max(100).default(0),
  generalDiscountAmount: z.coerce.number().default(0),
  taxAmount: z.coerce.number().default(0),
  roundingDifference: z.coerce.number().default(0),
  grandTotal: z.coerce.number().default(0),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
