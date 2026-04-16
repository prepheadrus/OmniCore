import { BadRequestException } from '@nestjs/common';

export class OutOfStockException extends BadRequestException {
  constructor(productId: string) {
    super(`Product with ID ${productId} is out of stock.`);
  }
}
