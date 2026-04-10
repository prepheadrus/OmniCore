import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceQueueService } from './marketplace-queue.service';
import { getQueueToken } from '@nestjs/bullmq';
import { MARKETPLACE_SYNC_QUEUE, JobTypes } from '../constants/queue.constants';
import { Queue } from 'bullmq';

describe('MarketplaceQueueService', () => {
  let service: MarketplaceQueueService;
  let queue: jest.Mocked<Queue>;

  beforeEach(async () => {
    const mockQueue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceQueueService,
        {
          provide: getQueueToken(MARKETPLACE_SYNC_QUEUE),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<MarketplaceQueueService>(MarketplaceQueueService);
    queue = module.get(getQueueToken(MARKETPLACE_SYNC_QUEUE));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a job to the queue with correct options (idempotency and backoff)', async () => {
    const payload = { id: 'test-id-123', data: { some: 'data' } };

    await service.addSyncJob(JobTypes.SYNC_ORDER, payload);

    expect(queue.add).toHaveBeenCalledWith(JobTypes.SYNC_ORDER, payload, {
      jobId: payload.id,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  });
});
