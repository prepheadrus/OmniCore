import { BadRequestException } from '@nestjs/common';

export class UnsupportedCargoProviderException extends BadRequestException {
  constructor(providerName: string) {
    super(`Unsupported cargo provider: ${providerName}`);
  }
}
