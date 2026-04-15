import { Test, TestingModule } from '@nestjs/testing';
import { InventoryReductionService } from '../inventory-reduction.service';
import { CircularDependencyException } from '../../exceptions/circular-dependency.exception';
import { OutOfStockException } from '../../exceptions/out-of-stock.exception';

describe('InventoryReductionService', () => {
  let service: InventoryReductionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryReductionService],
    }).compile();

    service = module.get<InventoryReductionService>(InventoryReductionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reduceStock', () => {
    it('should reduce stock for a single product', async () => {
      const mockTx = {
        product: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'prod-1',
            stock: 10,
            bundleItems: [],
          }),
          update: jest.fn().mockResolvedValue({}),
        },
      } as any;

      await service.reduceStock('prod-1', 2, mockTx);

      expect(mockTx.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        include: { bundleItems: true },
      });

      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: {
          stock: {
            decrement: 2,
          },
        },
      });
    });

    it('should throw OutOfStockException if single product does not have enough stock', async () => {
      const mockTx = {
        product: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'prod-1',
            stock: 5,
            bundleItems: [],
          }),
          update: jest.fn().mockResolvedValue({}),
        },
      } as any;

      await expect(service.reduceStock('prod-1', 10, mockTx)).rejects.toThrow(
        OutOfStockException
      );
    });

    it('should reduce stock for components of a 2-level nested bundle', async () => {
      const dbState = {
        'bundle-1': { id: 'bundle-1', stock: 0, bundleItems: [{ childId: 'bundle-2', quantity: 2 }] },
        'bundle-2': { id: 'bundle-2', stock: 0, bundleItems: [{ childId: 'prod-1', quantity: 3 }] },
        'prod-1': { id: 'prod-1', stock: 100, bundleItems: [] },
      };

      const mockTx = {
        product: {
          findUnique: jest.fn().mockImplementation(({ where }) => {
            return Promise.resolve(dbState[where.id as keyof typeof dbState]);
          }),
          update: jest.fn().mockResolvedValue({}),
        },
      } as any;

      // bundle-1 (qty=2) -> 2 * bundle-2
      // bundle-2 -> 3 * prod-1
      // Total prod-1 to reduce = 2 * 2 * 3 = 12
      await service.reduceStock('bundle-1', 2, mockTx);

      expect(mockTx.product.update).toHaveBeenCalledTimes(1);
      expect(mockTx.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: {
          stock: {
            decrement: 12,
          },
        },
      });
    });

    it('should throw CircularDependencyException on A -> B -> A', async () => {
      const dbState = {
        'bundle-A': { id: 'bundle-A', stock: 0, bundleItems: [{ childId: 'bundle-B', quantity: 1 }] },
        'bundle-B': { id: 'bundle-B', stock: 0, bundleItems: [{ childId: 'bundle-A', quantity: 1 }] },
      };

      const mockTx = {
        product: {
          findUnique: jest.fn().mockImplementation(({ where }) => {
            return Promise.resolve(dbState[where.id as keyof typeof dbState]);
          }),
          update: jest.fn().mockResolvedValue({}),
        },
      } as any;

      await expect(service.reduceStock('bundle-A', 1, mockTx)).rejects.toThrow(
        CircularDependencyException
      );
    });
  });

  describe('calculateMaxBundleCapacity', () => {
    it('should calculate max capacity based on components', async () => {
      // bundle-1 needs 2 * prod-1 and 5 * prod-2
      const dbState = {
        'bundle-1': {
          id: 'bundle-1',
          stock: 0,
          bundleItems: [
            { childId: 'prod-1', quantity: 2 },
            { childId: 'prod-2', quantity: 5 },
          ],
        },
        'prod-1': { id: 'prod-1', stock: 11, bundleItems: [] }, // 11 / 2 = 5
        'prod-2': { id: 'prod-2', stock: 24, bundleItems: [] }, // 24 / 5 = 4
      };

      const mockTx = {
        product: {
          findUnique: jest.fn().mockImplementation(({ where }) => {
            return Promise.resolve(dbState[where.id as keyof typeof dbState]);
          }),
        },
      } as any;

      const capacity = await service.calculateMaxBundleCapacity('bundle-1', mockTx);
      expect(capacity).toBe(4);
    });

    it('should return 0 if a component has 0 stock', async () => {
      const dbState = {
        'bundle-1': {
          id: 'bundle-1',
          stock: 0,
          bundleItems: [
            { childId: 'prod-1', quantity: 2 },
            { childId: 'prod-2', quantity: 5 },
          ],
        },
        'prod-1': { id: 'prod-1', stock: 11, bundleItems: [] },
        'prod-2': { id: 'prod-2', stock: 0, bundleItems: [] },
      };

      const mockTx = {
        product: {
          findUnique: jest.fn().mockImplementation(({ where }) => {
            return Promise.resolve(dbState[where.id as keyof typeof dbState]);
          }),
        },
      } as any;

      const capacity = await service.calculateMaxBundleCapacity('bundle-1', mockTx);
      expect(capacity).toBe(0);
    });

    it('should throw CircularDependencyException on A -> B -> A', async () => {
      const dbState = {
        'bundle-A': { id: 'bundle-A', stock: 0, bundleItems: [{ childId: 'bundle-B', quantity: 1 }] },
        'bundle-B': { id: 'bundle-B', stock: 0, bundleItems: [{ childId: 'bundle-A', quantity: 1 }] },
      };

      const mockTx = {
        product: {
          findUnique: jest.fn().mockImplementation(({ where }) => {
            return Promise.resolve(dbState[where.id as keyof typeof dbState]);
          }),
        },
      } as any;

      await expect(service.calculateMaxBundleCapacity('bundle-A', mockTx)).rejects.toThrow(
        CircularDependencyException
      );
    });
  });
});
