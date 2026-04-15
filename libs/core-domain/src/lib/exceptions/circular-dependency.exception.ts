import { BadRequestException } from '@nestjs/common';

export class CircularDependencyException extends BadRequestException {
  constructor(productId: string) {
    super(`Circular dependency detected for bundle/product with ID ${productId}.`);
  }
}
