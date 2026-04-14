import { Injectable } from '@nestjs/common';
import { IInvoiceAdapter } from '../interfaces/invoice-adapter.interface';
import { ParasutAdapter } from '../providers/parasut.adapter';
import { UnsupportedInvoiceProviderException } from '../exceptions/unsupported-invoice-provider.exception';

@Injectable()
export class InvoiceAdapterFactory {
  getAdapter(providerName: string): IInvoiceAdapter {
    switch (providerName.toLowerCase()) {
      case 'parasut':
        return new ParasutAdapter();
      default:
        throw new UnsupportedInvoiceProviderException(providerName);
    }
  }
}
