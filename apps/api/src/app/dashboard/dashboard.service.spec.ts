import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { DatabaseService } from '@omnicore/database';
import { ClsService } from 'nestjs-cls';

describe('DashboardService', () => {
  let service: DashboardService;
  let db: DatabaseService;
  let cls: ClsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: DatabaseService,
          useValue: {
            client: {
              product: {
                count: jest.fn(),
                findMany: jest.fn(),
              },
              order: {
                aggregate: jest.fn(),
              },
            },
          },
        },
        {
          provide: ClsService,
          useValue: {
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    db = module.get<DatabaseService>(DatabaseService);
    cls = module.get<ClsService>(ClsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should aggregate total revenue correctly without fetching all orders', async () => {
      // Arrange
      const mockProductCount = 10;
      const mockTotalRevenue = 500.5;

      (db.client.product.count as jest.Mock).mockResolvedValue(mockProductCount);
      (db.client.order.aggregate as jest.Mock).mockResolvedValue({
        _sum: { totalAmount: mockTotalRevenue },
      });

      // Act
      const result = await service.getSummary();

      // Assert
      expect(cls.set).toHaveBeenCalledWith('app.channel_id', 'system-admin');
      expect(db.client.product.count).toHaveBeenCalled();

      // Verify aggregate is called instead of findMany (which would pull all data to memory)
      expect(db.client.order.aggregate).toHaveBeenCalledWith({
        _sum: {
          totalAmount: true,
        },
      });

      expect(result).toEqual({
        productsCount: mockProductCount,
        totalRevenue: mockTotalRevenue,
        currency: 'TRY',
      });
    });

    it('should handle null aggregate response (fallback to 0)', async () => {
      // Arrange
      (db.client.product.count as jest.Mock).mockResolvedValue(5);
      (db.client.order.aggregate as jest.Mock).mockResolvedValue({
        _sum: { totalAmount: null },
      });

      // Act
      const result = await service.getSummary();

      // Assert
      expect(result.totalRevenue).toBe(0);
    });
  });

  describe('getProducts', () => {
    it('should find many products', async () => {
      // Arrange
      const mockProducts = [{ id: 'p1' }, { id: 'p2' }];
      (db.client.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await service.getProducts();

      // Assert
      expect(cls.set).toHaveBeenCalledWith('app.channel_id', 'system-admin');
      expect(db.client.product.findMany).toHaveBeenCalledWith({
        take: 20,
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual(mockProducts);
    });
  });
});
