import { InvoiceAdapterFactory } from '../invoice-adapter.factory';
import { ParasutAdapter } from '../../providers/parasut.adapter';
import { UnsupportedInvoiceProviderException } from '../../exceptions/unsupported-invoice-provider.exception';
import { Order } from '@prisma/client';

describe('InvoiceAdapterFactory', () => {
  let factory: InvoiceAdapterFactory;

  beforeEach(() => {
    factory = new InvoiceAdapterFactory();
  });

  it('should return ParasutAdapter when provider is parasut', () => {
    const adapter = factory.getAdapter('parasut');
    expect(adapter).toBeInstanceOf(ParasutAdapter);
  });

  it('should throw UnsupportedInvoiceProviderException when provider is unknown', () => {
    expect(() => factory.getAdapter('unknown-provider')).toThrow(
      UnsupportedInvoiceProviderException
    );
  });
});

describe('ParasutAdapter', () => {
  it('should return mock pdf link for given order', async () => {
    const adapter = new ParasutAdapter();
    const mockOrder: Partial<Order> = { id: 'test-order-id' };

    const result = await adapter.generateInvoice(mockOrder as Order);

    expect(typeof result).toBe('string');
    expect(result).toBe('https://mock-parasut.com/invoice/test-order-id.pdf');
  });
});
