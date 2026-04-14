import { Order } from '@prisma/client';
import { ICargoAdapter } from '../interfaces/cargo-adapter.interface';

export class YurticiCargoAdapter implements ICargoAdapter {
  async generateBarcode(order: Order): Promise<string> {
    // Mock implementation
    return `YURTICI-${order.id}-BARCODE`;
  }
}
