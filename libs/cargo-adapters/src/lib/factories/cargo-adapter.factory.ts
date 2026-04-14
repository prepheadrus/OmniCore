import { Injectable } from '@nestjs/common';
import { ICargoAdapter } from '../interfaces/cargo-adapter.interface';
import { YurticiCargoAdapter } from '../providers/yurtici.adapter';
import { UnsupportedCargoProviderException } from '../exceptions/unsupported-cargo-provider.exception';

@Injectable()
export class CargoAdapterFactory {
  getAdapter(providerName: string): ICargoAdapter {
    switch (providerName.toLowerCase()) {
      case 'yurtici':
        return new YurticiCargoAdapter();
      default:
        throw new UnsupportedCargoProviderException(providerName);
    }
  }
}
