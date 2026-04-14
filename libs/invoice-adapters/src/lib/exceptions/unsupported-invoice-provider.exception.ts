import { BadRequestException } from '@nestjs/common';

export class UnsupportedInvoiceProviderException extends BadRequestException {
  constructor(providerName: string) {
    super(`Unsupported invoice provider: ${providerName}`);
  }
}
