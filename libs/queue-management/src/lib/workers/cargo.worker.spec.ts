import { Test, TestingModule } from '@nestjs/testing';
import { CargoWorker } from './cargo.worker';
import { Job, UnrecoverableError } from 'bullmq';
import { DatabaseService } from '@omnicore/database';
import { ClsService } from 'nestjs-cls';
import { CargoAdapterFactory } from '@omnicore/cargo-adapters';

describe('CargoWorker', () => {
  let worker: CargoWorker;

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

  const mockCargoAdapter = {
    generateBarcode: jest.fn(),
  };

  const mockCargoAdapterFactory = {
    getAdapter: jest.fn().mockReturnValue(mockCargoAdapter),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CargoWorker,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: ClsService, useValue: mockClsService },
        { provide: CargoAdapterFactory, useValue: mockCargoAdapterFactory },
      ],
    }).compile();

    worker = module.get<CargoWorker>(CargoWorker);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(worker).toBeDefined();
  });

  it('should process a valid cargo job and generate barcode', async () => {
    const job = {
      id: 'test-cargo-job',
      data: {
        channelId: 'test-channel',
        orderId: 'ORD-123',
      },
    } as unknown as Job;

    const mockOrder = { orderNumber: 'ORD-123' };
    mockDatabaseService.client.order.findUnique.mockResolvedValue(mockOrder);
    mockCargoAdapter.generateBarcode.mockResolvedValue('MOCK_BARCODE_STRING');

    const result = await worker.process(job);

    expect(result).toEqual({ success: true, jobId: 'test-cargo-job' });
    expect(mockClsService.runWith).toHaveBeenCalled();
    expect(mockDatabaseService.client.order.findUnique).toHaveBeenCalledWith({
      where: { orderNumber: 'ORD-123' },
    });
    expect(mockCargoAdapterFactory.getAdapter).toHaveBeenCalledWith('yurtici');
    expect(mockCargoAdapter.generateBarcode).toHaveBeenCalledWith(mockOrder);
  });

  it('should throw UnrecoverableError if channelId or orderId is missing', async () => {
    const job = {
      id: 'test-cargo-job',
      data: {
        channelId: 'test-channel',
      },
    } as unknown as Job;

    await expect(worker.process(job)).rejects.toThrow(UnrecoverableError);
  });

  it('should throw UnrecoverableError if order is not found', async () => {
    const job = {
      id: 'test-cargo-job',
      data: {
        channelId: 'test-channel',
        orderId: 'ORD-123',
      },
    } as unknown as Job;

    mockDatabaseService.client.order.findUnique.mockResolvedValue(null);

    await expect(worker.process(job)).rejects.toThrow(UnrecoverableError);
  });
});
