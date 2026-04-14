import { Test, TestingModule } from '@nestjs/testing';
import { CoreQueueService } from './core-queue.service';
import { getQueueToken } from '@nestjs/bullmq';
import { MARKETPLACE_SYNC_QUEUE, INVOICE_QUEUE, CARGO_QUEUE, JobTypes } from '../constants/queue.constants';
import { Queue } from 'bullmq';

describe('CoreQueueService', () => {
  let service: CoreQueueService;
  let syncQueue: jest.Mocked<Queue>;
  let invoiceQueue: jest.Mocked<Queue>;
  let cargoQueue: jest.Mocked<Queue>;

  beforeEach(async () => {
    const mockSyncQueue = { add: jest.fn() };
    const mockInvoiceQueue = { add: jest.fn() };
    const mockCargoQueue = { add: jest.fn() };

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
      ],
    }).compile();

    service = module.get<CoreQueueService>(CoreQueueService);
    syncQueue = module.get(getQueueToken(MARKETPLACE_SYNC_QUEUE));
    invoiceQueue = module.get(getQueueToken(INVOICE_QUEUE));
    cargoQueue = module.get(getQueueToken(CARGO_QUEUE));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a job to the sync queue with correct options (idempotency and backoff)', async () => {
    const payload = { id: 'test-id-123', data: { some: 'data' } };

    await service.addSyncJob(JobTypes.SYNC_ORDER, payload);

    expect(syncQueue.add).toHaveBeenCalledWith(JobTypes.SYNC_ORDER, payload, {
      jobId: payload.id,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  });

  it('should add a job to the invoice queue with correct options', async () => {
    const payload = { id: 'test-id-invoice', data: { orderId: 'order1' } };

    await service.addInvoiceJob(JobTypes.GENERATE_INVOICE, payload);

    expect(invoiceQueue.add).toHaveBeenCalledWith(JobTypes.GENERATE_INVOICE, payload, {
      jobId: payload.id,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  });

  it('should add a job to the cargo queue with correct options', async () => {
    const payload = { id: 'test-id-cargo', data: { orderId: 'order1' } };

    await service.addCargoJob(JobTypes.GENERATE_CARGO_BARCODE, payload);

    expect(cargoQueue.add).toHaveBeenCalledWith(JobTypes.GENERATE_CARGO_BARCODE, payload, {
      jobId: payload.id,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  });
});
