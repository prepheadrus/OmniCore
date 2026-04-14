import { Order } from '@prisma/client';

export interface ICargoAdapter {
  generateBarcode(order: Order): Promise<string>;
}
