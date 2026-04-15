import { Test, TestingModule } from '@nestjs/testing';
import { QueueController } from './queue.controller';
import { CoreQueueService, JobTypes } from '@omnicore/queue-management';
import { SyncRequestDto } from '../dto/sync-request.dto';

describe('QueueController', () => {
  let controller: QueueController;
  let queueService: CoreQueueService;

  const mockQueueService = {
    addSyncJob: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueController],
      providers: [
        {
          provide: CoreQueueService,
          useValue: mockQueueService,
        },
      ],
    }).compile();

    controller = module.get<QueueController>(QueueController);
    queueService = module.get<CoreQueueService>(CoreQueueService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('syncOrders', () => {
    it('should successfully dispatch order sync jobs for multiple channels', async () => {
      const syncRequestDto: SyncRequestDto = {
        tenantId: 'tenant-123',
        marketplace: 'Trendyol',
        channelIds: ['channel-1', 'channel-2'],
      };

      const result = await controller.syncOrders(syncRequestDto);

      expect(queueService.addSyncJob).toHaveBeenCalledTimes(2);

      expect(queueService.addSyncJob).toHaveBeenNthCalledWith(
        1,
        JobTypes.FETCH_ORDERS,
        {
          tenantId: 'tenant-123',
          marketplace: 'Trendyol',
          channelId: 'channel-1',
          type: JobTypes.FETCH_ORDERS,
        },
        expect.any(String),
      );

      expect(queueService.addSyncJob).toHaveBeenNthCalledWith(
        2,
        JobTypes.FETCH_ORDERS,
        {
          tenantId: 'tenant-123',
          marketplace: 'Trendyol',
          channelId: 'channel-2',
          type: JobTypes.FETCH_ORDERS,
        },
        expect.any(String),
      );

      expect(result).toHaveProperty('message', 'Order synchronization jobs accepted');
      expect(result.jobIds).toHaveLength(2);
      expect(result.jobIds[0]).not.toBe(result.jobIds[1]); // Ensure different uuids
    });

    it('should successfully dispatch order sync job without marketplace (optional field)', async () => {
      const syncRequestDto: SyncRequestDto = {
        tenantId: 'tenant-123',
        channelIds: ['channel-1'],
      };

      const result = await controller.syncOrders(syncRequestDto);

      expect(queueService.addSyncJob).toHaveBeenCalledTimes(1);

      expect(queueService.addSyncJob).toHaveBeenCalledWith(
        JobTypes.FETCH_ORDERS,
        {
          tenantId: 'tenant-123',
          marketplace: undefined,
          channelId: 'channel-1',
          type: JobTypes.FETCH_ORDERS,
        },
        expect.any(String),
      );

      expect(result).toHaveProperty('message', 'Order synchronization jobs accepted');
      expect(result.jobIds).toHaveLength(1);
    });

    it('should throw an error if queue service fails', async () => {
      const syncRequestDto: SyncRequestDto = {
        tenantId: 'tenant-123',
        channelIds: ['channel-1'],
      };

      mockQueueService.addSyncJob.mockRejectedValueOnce(new Error('Queue unavailable'));

      await expect(controller.syncOrders(syncRequestDto)).rejects.toThrow('Queue unavailable');
      expect(queueService.addSyncJob).toHaveBeenCalledTimes(1);
    });
  });

  describe('syncProducts', () => {
    it('should successfully dispatch product sync jobs for multiple channels', async () => {
      const syncRequestDto: SyncRequestDto = {
        tenantId: 'tenant-456',
        marketplace: 'Amazon',
        channelIds: ['channel-3', 'channel-4'],
      };

      const result = await controller.syncProducts(syncRequestDto);

      expect(queueService.addSyncJob).toHaveBeenCalledTimes(2);

      expect(queueService.addSyncJob).toHaveBeenNthCalledWith(
        1,
        JobTypes.FETCH_PRODUCTS,
        {
          tenantId: 'tenant-456',
          marketplace: 'Amazon',
          channelId: 'channel-3',
          type: JobTypes.FETCH_PRODUCTS,
        },
        expect.any(String),
      );

      expect(queueService.addSyncJob).toHaveBeenNthCalledWith(
        2,
        JobTypes.FETCH_PRODUCTS,
        {
          tenantId: 'tenant-456',
          marketplace: 'Amazon',
          channelId: 'channel-4',
          type: JobTypes.FETCH_PRODUCTS,
        },
        expect.any(String),
      );

      expect(result).toHaveProperty('message', 'Product synchronization jobs accepted');
      expect(result.jobIds).toHaveLength(2);
      expect(result.jobIds[0]).not.toBe(result.jobIds[1]); // Ensure different uuids
    });

    it('should successfully dispatch product sync job without marketplace (optional field)', async () => {
      const syncRequestDto: SyncRequestDto = {
        tenantId: 'tenant-456',
        channelIds: ['channel-3'],
      };

      const result = await controller.syncProducts(syncRequestDto);

      expect(queueService.addSyncJob).toHaveBeenCalledTimes(1);

      expect(queueService.addSyncJob).toHaveBeenCalledWith(
        JobTypes.FETCH_PRODUCTS,
        {
          tenantId: 'tenant-456',
          marketplace: undefined,
          channelId: 'channel-3',
          type: JobTypes.FETCH_PRODUCTS,
        },
        expect.any(String),
      );

      expect(result).toHaveProperty('message', 'Product synchronization jobs accepted');
      expect(result.jobIds).toHaveLength(1);
    });

    it('should throw an error if queue service fails', async () => {
      const syncRequestDto: SyncRequestDto = {
        tenantId: 'tenant-456',
        channelIds: ['channel-3'],
      };

      mockQueueService.addSyncJob.mockRejectedValueOnce(new Error('Redis connection lost'));

      await expect(controller.syncProducts(syncRequestDto)).rejects.toThrow('Redis connection lost');
      expect(queueService.addSyncJob).toHaveBeenCalledTimes(1);
    });
  });
});
