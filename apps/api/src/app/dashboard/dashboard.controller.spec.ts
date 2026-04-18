import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getSummary: jest.fn(),
            getProducts: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should call DashboardService.getSummary and return its result', async () => {
      // Arrange
      const mockSummary = { productsCount: 10, totalRevenue: 100, currency: 'TRY' };
      (service.getSummary as jest.Mock).mockResolvedValue(mockSummary);

      // Act
      const result = await controller.getSummary();

      // Assert
      expect(service.getSummary).toHaveBeenCalled();
      expect(result).toEqual(mockSummary);
    });
  });

  describe('getProducts', () => {
    it('should call DashboardService.getProducts and return its result', async () => {
      // Arrange
      const mockProducts = [{ id: 'p1' }, { id: 'p2' }];
      (service.getProducts as jest.Mock).mockResolvedValue(mockProducts );

      // Act
      const result = await controller.getProducts();

      // Assert
      expect(service.getProducts).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });
});
