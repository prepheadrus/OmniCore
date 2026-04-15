import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SyncCronService } from './sync.cron';
import { MockMarketplaceAdapter } from '@omnicore/marketplace-adapters';
import { CoreQueueService, JobTypes } from '@omnicore/queue-management';

describe('SyncCronService', () => {
  let service: SyncCronService;
  let queueService: CoreQueueService;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncCronService,
        {
          provide: MockMarketplaceAdapter,
          useValue: {},
        },
        {
          provide: CoreQueueService,
          useValue: {
            addSyncJob: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SyncCronService>(SyncCronService);
    queueService = module.get<CoreQueueService>(CoreQueueService);

    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCron', () => {
    it('should successfully add FETCH_ORDERS and FETCH_PRODUCTS jobs to the queue', async () => {
      const mockDate = 123456789;
      const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(mockDate);

      await service.handleCron();

      expect(queueService.addSyncJob).toHaveBeenCalledTimes(2);

      expect(queueService.addSyncJob).toHaveBeenNthCalledWith(
        1,
        JobTypes.FETCH_ORDERS,
        { channelId: 'trendyol-mock' },
        `fetch-orders-${mockDate}`
      );

      expect(queueService.addSyncJob).toHaveBeenNthCalledWith(
        2,
        JobTypes.FETCH_PRODUCTS,
        { channelId: 'trendyol-mock' },
        `fetch-products-${mockDate}`
      );

      dateSpy.mockRestore();
    });

    it('should catch and log errors if adding a job fails', async () => {
      const error = new Error('Test error');
      jest.spyOn(queueService, 'addSyncJob').mockRejectedValueOnce(error);

      await service.handleCron();

      expect(loggerErrorSpy).toHaveBeenCalledWith('Error during marketplace sync cron job', error);
    });
  });
});
