import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceSyncWorker } from './marketplace-sync.worker';
import { Job, UnrecoverableError } from 'bullmq';
import { MarketplaceValidationException } from '@omnicore/marketplace-adapters';
import { AxiosError, AxiosHeaders } from 'axios';
import { DatabaseService } from '@omnicore/database';
import { ClsService } from 'nestjs-cls';
import { JobTypes } from '../constants/queue.constants';
import { CoreQueueService } from '../services/core-queue.service';
import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { BomResolverService } from '@omnicore/pim';

describe('MarketplaceSyncWorker', () => {
  let worker: MarketplaceSyncWorker;

  const mockDatabaseService = {
    client: {
      order: {
        upsert: jest.fn(),
      },
      salesChannel: {
        upsert: jest.fn(),
      },
      $transaction: jest.fn(),
    },
  };

  const mockClsService = {
    runWith: jest.fn((context, callback) => callback()),
    set: jest.fn(),
  };

  const mockQueueService = {
    addSyncJob: jest.fn(),
    addInvoiceJob: jest.fn(),
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockBomResolverService = {
    resolveBundle: jest.fn().mockResolvedValue(new Map([['variant-1', 1]])),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceSyncWorker,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: ClsService, useValue: mockClsService },
        { provide: CoreQueueService, useValue: mockQueueService },
        { provide: getRedisConnectionToken('default'), useValue: mockRedisService },
        { provide: BomResolverService, useValue: mockBomResolverService },
      ],
    }).compile();

    worker = module.get<MarketplaceSyncWorker>(MarketplaceSyncWorker);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(worker).toBeDefined();
  });

  it('should process a valid SYNC_ORDER job successfully and enqueue invoice if SHIPPED', async () => {
    const job = {
      id: 'test-job',
      name: JobTypes.SYNC_ORDER,
      data: {
        channelId: 'system-ai',
        type: JobTypes.SYNC_ORDER,
        payload: {
          orderNumber: 'ORD-123',
          totalAmount: 100,
          status: 'SHIPPED',
          createdAt: new Date(),
        },
      },
    } as unknown as Job;

    const mockTx = {
      order: {
        upsert: jest.fn(),
      },
      productVariant: {
        findFirst: jest.fn().mockResolvedValue({ id: 'variant-1' }),
        update: jest.fn(),
      },
      stockMovement: {
        create: jest.fn(), createMany: jest.fn(),
      },
    };

    mockDatabaseService.client.$transaction.mockImplementationOnce(async (cb: any) => {
      return cb(mockTx);
    });

    const result = await worker.process(job);

    expect(result).toEqual({ success: true, jobId: 'test-job' });
    expect(mockClsService.runWith).toHaveBeenCalled();
    expect(mockTx.order.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orderNumber: 'ORD-123' },
      })
    );
    expect(mockQueueService.addInvoiceJob).toHaveBeenCalledWith(
      JobTypes.GENERATE_INVOICE,
      expect.objectContaining({
        orderId: 'ORD-123',
        channelId: 'system-ai',
      }),
      'invoice-ORD-123'
    );
  });

  it('should process a valid SYNC_ORDER job but not enqueue invoice if PENDING', async () => {
    const job = {
      id: 'test-job',
      name: JobTypes.SYNC_ORDER,
      data: {
        channelId: 'system-ai',
        type: JobTypes.SYNC_ORDER,
        payload: {
          orderNumber: 'ORD-123',
          totalAmount: 100,
          status: 'PENDING',
          createdAt: new Date(),
        },
      },
    } as unknown as Job;

    const mockTx = {
      order: {
        upsert: jest.fn(),
      },
      productVariant: {
        findFirst: jest.fn().mockResolvedValue({ id: 'variant-1' }),
        update: jest.fn(),
      },
      stockMovement: {
        create: jest.fn(), createMany: jest.fn(),
      },
    };

    mockDatabaseService.client.$transaction.mockImplementationOnce(async (cb: any) => {
      return cb(mockTx);
    });

    const result = await worker.process(job);

    expect(result).toEqual({ success: true, jobId: 'test-job' });
    expect(mockClsService.runWith).toHaveBeenCalled();
    expect(mockTx.order.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { orderNumber: 'ORD-123' },
      })
    );
    expect(mockQueueService.addInvoiceJob).not.toHaveBeenCalled();
  });

  it('should throw UnrecoverableError if channelId is missing', async () => {
    const job = {
      id: 'test-job',
      name: JobTypes.SYNC_ORDER,
      data: {
        type: JobTypes.SYNC_ORDER,
        payload: {},
      },
    } as unknown as Job;

    await expect(worker.process(job)).rejects.toThrow(UnrecoverableError);
  });

  it('should throw UnrecoverableError for MarketplaceValidationException', async () => {
    const job = {
      id: 'test-job',
      name: 'sync-order',
      data: { channelId: 'test' },
    } as unknown as Job;

    const error = new MarketplaceValidationException(
      'trendyol',
      'remote-id',
      [],
    );

    mockClsService.runWith.mockImplementationOnce(() => {
      throw error;
    });

    await expect(worker.process(job)).rejects.toThrow(UnrecoverableError);
  });

  it('should throw AxiosError for network errors (e.g. 429)', async () => {
    const job = {
      id: 'test-job',
      name: 'sync-order',
      data: { channelId: 'test' },
    } as unknown as Job;

    const axiosError = new AxiosError('Too many requests', '429');
    axiosError.response = {
      status: 429,
      data: {},
      statusText: 'Too many requests',
      headers: {},
      config: { headers: new AxiosHeaders() },
    };

    mockClsService.runWith.mockImplementationOnce(() => {
      throw axiosError;
    });

    await expect(worker.process(job)).rejects.toThrow(AxiosError);
  });

  it('should throw standard errors for generic issues', async () => {
    const job = {
      id: 'test-job',
      name: 'sync-order',
      data: { channelId: 'test' },
    } as unknown as Job;
    const standardError = new Error('Some random error');

    mockClsService.runWith.mockImplementationOnce(() => {
      throw standardError;
    });

    await expect(worker.process(job)).rejects.toThrow(Error);
  });
});
