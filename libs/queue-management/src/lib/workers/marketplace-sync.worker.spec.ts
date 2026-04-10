import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceSyncWorker } from './marketplace-sync.worker';
import { Job, UnrecoverableError } from 'bullmq';
import { MarketplaceValidationException } from '@omnicore/marketplace-adapters';
import { AxiosError, AxiosHeaders } from 'axios';

describe('MarketplaceSyncWorker', () => {
  let worker: MarketplaceSyncWorker;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketplaceSyncWorker],
    }).compile();

    worker = module.get<MarketplaceSyncWorker>(MarketplaceSyncWorker);
  });

  it('should be defined', () => {
    expect(worker).toBeDefined();
  });

  it('should process a job successfully', async () => {
    const job = {
      id: 'test-job',
      name: 'sync-order',
      data: { id: 'payload-id', data: {} },
    } as unknown as Job;
    const result = await worker.process(job);
    expect(result).toEqual({ success: true, jobId: 'test-job' });
  });

  it('should throw UnrecoverableError for MarketplaceValidationException', async () => {
    const job = {
      id: 'test-job',
      name: 'sync-order',
      data: {},
    } as unknown as Job;
    const error = new MarketplaceValidationException(
      'trendyol',
      'remote-id',
      [],
    );

    jest.spyOn(worker['logger'], 'debug').mockImplementation(() => {
      throw error;
    });

    await expect(worker.process(job)).rejects.toThrow(UnrecoverableError);
  });

  it('should throw AxiosError for network errors (e.g. 429)', async () => {
    const job = {
      id: 'test-job',
      name: 'sync-order',
      data: {},
    } as unknown as Job;

    const axiosError = new AxiosError('Too many requests', '429');
    axiosError.response = {
      status: 429,
      data: {},
      statusText: 'Too many requests',
      headers: {},
      config: { headers: new AxiosHeaders() },
    };

    jest.spyOn(worker['logger'], 'debug').mockImplementation(() => {
      throw axiosError;
    });

    await expect(worker.process(job)).rejects.toThrow(AxiosError);
  });

  it('should throw standard errors for generic issues', async () => {
    const job = {
      id: 'test-job',
      name: 'sync-order',
      data: {},
    } as unknown as Job;
    const standardError = new Error('Some random error');

    jest.spyOn(worker['logger'], 'debug').mockImplementation(() => {
      throw standardError;
    });

    await expect(worker.process(job)).rejects.toThrow(Error);
  });
});
