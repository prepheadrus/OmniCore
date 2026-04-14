import { Order } from '@prisma/client';

export interface IInvoiceAdapter {
  generateInvoice(order: Order): Promise<string>;
}
