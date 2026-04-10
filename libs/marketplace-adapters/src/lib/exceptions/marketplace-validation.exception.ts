import { ValidationError } from 'class-validator';

export class MarketplaceValidationException extends Error {
  constructor(
    public marketplace: string,
    public remoteId: string,
    public validationErrors: ValidationError[],
    message?: string
  ) {
    super(message || `Validation failed for ${marketplace} entity with remoteId ${remoteId}`);
    this.name = 'MarketplaceValidationException';
  }
}
