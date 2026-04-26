import { Test, TestingModule } from '@nestjs/testing';
import { CoreQueueService } from './core-queue.service';
import { getQueueToken } from '@nestjs/bullmq';
import { MARKETPLACE_SYNC_QUEUE, INVOICE_QUEUE, CARGO_QUEUE, REPRICER_QUEUE, JobTypes } from '../constants/queue.constants';
import { Queue } from 'bullmq';

describe('CoreQueueService', () => {
  let service: CoreQueueService;
  let syncQueue: jest.Mocked<Queue>;
  let invoiceQueue: jest.Mocked<Queue>;
  let cargoQueue: jest.Mocked<Queue>;
  let repricerQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    const mockSyncQueue = { add: jest.fn() };
    const mockInvoiceQueue = { add: jest.fn() };
    const mockCargoQueue = { add: jest.fn() };
    const mockRepricerQueue = { add: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreQueueService,
        {
          provide: getQueueToken(MARKETPLACE_SYNC_QUEUE),
          useValue: mockSyncQueue,
        },
        {
          provide: getQueueToken(INVOICE_QUEUE),
          useValue: mockInvoiceQueue,
        },
        {
          provide: getQueueToken(CARGO_QUEUE),
          useValue: mockCargoQueue,
        },
        {
          provide: getQueueToken(REPRICER_QUEUE),
          useValue: mockRepricerQueue,
        },
      ],
    }).compile();

    service = module.get<CoreQueueService>(CoreQueueService);
    syncQueue = module.get(getQueueToken(MARKETPLACE_SYNC_QUEUE));
    invoiceQueue = module.get(getQueueToken(INVOICE_QUEUE));
    cargoQueue = module.get(getQueueToken(CARGO_QUEUE));
    repricerQueue = module.get(getQueueToken(REPRICER_QUEUE));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a job to the sync queue with correct options (idempotency and backoff)', async () => {
    const payload = { channelId: '123', type: 'SYNC' };

    await service.addSyncJob(JobTypes.SYNC_ORDER, payload, 'test-id-123');

    expect(syncQueue.add).toHaveBeenCalledWith(JobTypes.SYNC_ORDER, payload, {
      jobId: 'test-id-123',
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  });

  it('should add a job to the invoice queue with correct options', async () => {
    const payload = { orderId: 'order1' };

    await service.addInvoiceJob(JobTypes.GENERATE_INVOICE, payload, 'test-id-invoice');

    expect(invoiceQueue.add).toHaveBeenCalledWith(JobTypes.GENERATE_INVOICE, payload, {
      jobId: 'test-id-invoice',
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  });

  it('should add a job to the cargo queue with correct options', async () => {
    const payload = { orderId: 'order1' };

    await service.addCargoJob(JobTypes.GENERATE_CARGO_BARCODE, payload, 'test-id-cargo');

    expect(cargoQueue.add).toHaveBeenCalledWith(JobTypes.GENERATE_CARGO_BARCODE, payload, {
      jobId: 'test-id-cargo',
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  });

  it('should add a job to the repricer queue with correct options', async () => {
    const payload = { productId: 'p1' };

    await service.addRepricerJob(JobTypes.REPRICE_UPDATE, payload, 'test-id-reprice');

    expect(repricerQueue.add).toHaveBeenCalledWith(JobTypes.REPRICE_UPDATE, payload, {
      jobId: 'test-id-reprice',
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  });
});
