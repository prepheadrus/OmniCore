import { CargoAdapterFactory } from '../cargo-adapter.factory';
import { YurticiCargoAdapter } from '../../providers/yurtici.adapter';
import { UnsupportedCargoProviderException } from '../../exceptions/unsupported-cargo-provider.exception';
import { Order } from '@prisma/client';

describe('CargoAdapterFactory', () => {
  let factory: CargoAdapterFactory;

  beforeEach(() => {
    factory = new CargoAdapterFactory();
  });

  it('should return YurticiCargoAdapter when provider is yurtici', () => {
    const adapter = factory.getAdapter('yurtici');
    expect(adapter).toBeInstanceOf(YurticiCargoAdapter);
  });

  it('should throw UnsupportedCargoProviderException when provider is unknown', () => {
    expect(() => factory.getAdapter('unknown-provider')).toThrow(
      UnsupportedCargoProviderException
    );
  });
});

describe('YurticiCargoAdapter', () => {
  it('should return mock barcode for given order', async () => {
    const adapter = new YurticiCargoAdapter();
    const mockOrder: Partial<Order> = { id: 'test-order-id' };

    const result = await adapter.generateBarcode(mockOrder as Order);

    expect(typeof result).toBe('string');
    expect(result).toBe('YURTICI-test-order-id-BARCODE');
  });
});
