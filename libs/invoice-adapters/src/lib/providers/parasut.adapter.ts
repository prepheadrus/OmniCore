import { Order } from '@prisma/client';
import { IInvoiceAdapter } from '../interfaces/invoice-adapter.interface';

export class ParasutAdapter implements IInvoiceAdapter {
  async generateInvoice(order: Order): Promise<string> {
    // Mock implementation
    return `https://mock-parasut.com/invoice/${order.id}.pdf`;
  }
}
