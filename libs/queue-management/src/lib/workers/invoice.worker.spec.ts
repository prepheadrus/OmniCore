import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceWorker } from './invoice.worker';
import { Job, UnrecoverableError } from 'bullmq';
import { DatabaseService } from '@omnicore/database';
import { ClsService } from 'nestjs-cls';
import { JobTypes } from '../constants/queue.constants';
import { CoreQueueService } from '../services/core-queue.service';
import { InvoiceAdapterFactory } from '@omnicore/invoice-adapters';

describe('InvoiceWorker', () => {
  let worker: InvoiceWorker;

  const mockDatabaseService = {
    client: {
      order: {
        findUnique: jest.fn(),
      },
    },
  };

  const mockClsService = {
    runWith: jest.fn((context, callback) => callback()),
    set: jest.fn(),
  };

  const mockQueueService = {
    addCargoJob: jest.fn(),
  };

  const mockInvoiceAdapter = {
    generateInvoice: jest.fn(),
  };

  const mockInvoiceAdapterFactory = {
    getAdapter: jest.fn().mockReturnValue(mockInvoiceAdapter),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceWorker,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: ClsService, useValue: mockClsService },
        { provide: CoreQueueService, useValue: mockQueueService },
        { provide: InvoiceAdapterFactory, useValue: mockInvoiceAdapterFactory },
      ],
    }).compile();

    worker = module.get<InvoiceWorker>(InvoiceWorker);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(worker).toBeDefined();
  });

  it('should process a valid invoice job and enqueue cargo job', async () => {
    const job = {
      id: 'test-invoice-job',
      data: {
        channelId: 'test-channel',
        orderId: 'ORD-123',
      },
    } as unknown as Job;

    const mockOrder = { orderNumber: 'ORD-123' };
    mockDatabaseService.client.order.findUnique.mockResolvedValue(mockOrder);
    mockInvoiceAdapter.generateInvoice.mockResolvedValue('MOCK_PDF_STRING');

    const result = await worker.process(job);

    expect(result).toEqual({ success: true, jobId: 'test-invoice-job' });
    expect(mockClsService.runWith).toHaveBeenCalled();
    expect(mockDatabaseService.client.order.findUnique).toHaveBeenCalledWith({
      where: { orderNumber: 'ORD-123' },
    });
    expect(mockInvoiceAdapterFactory.getAdapter).toHaveBeenCalledWith('parasut');
    expect(mockInvoiceAdapter.generateInvoice).toHaveBeenCalledWith(mockOrder);
    expect(mockQueueService.addCargoJob).toHaveBeenCalledWith(
      JobTypes.GENERATE_CARGO_BARCODE,
      expect.objectContaining({
        id: 'cargo-ORD-123',
        data: { orderId: 'ORD-123', channelId: 'test-channel' },
      }),
    );
  });

  it('should throw UnrecoverableError if channelId or orderId is missing', async () => {
    const job = {
      id: 'test-invoice-job',
      data: {
        channelId: 'test-channel',
      },
    } as unknown as Job;

    await expect(worker.process(job)).rejects.toThrow(UnrecoverableError);
  });

  it('should throw UnrecoverableError if order is not found', async () => {
    const job = {
      id: 'test-invoice-job',
      data: {
        channelId: 'test-channel',
        orderId: 'ORD-123',
      },
    } as unknown as Job;

    mockDatabaseService.client.order.findUnique.mockResolvedValue(null);

    await expect(worker.process(job)).rejects.toThrow(UnrecoverableError);
  });
});
