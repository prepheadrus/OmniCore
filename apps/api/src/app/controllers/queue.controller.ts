import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoreQueueService, JobTypes } from '@omnicore/queue-management';
import { SyncRequestDto } from '../dto/sync-request.dto';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Queue Management')
@Controller('sync')
export class QueueController {
  constructor(private readonly queueService: CoreQueueService) {}

  @Post('orders')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger order synchronization manually' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Order sync job created',
  })
  async syncOrders(@Body() syncRequestDto: SyncRequestDto) {
    const jobIds: string[] = [];
    const BATCH_SIZE = 50;

    for (let i = 0; i < syncRequestDto.channelIds.length; i += BATCH_SIZE) {
      const batch = syncRequestDto.channelIds.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (channelId) => {
        const jobId = uuidv4();
        await this.queueService.addSyncJob(
          JobTypes.FETCH_ORDERS,
          {
            tenantId: syncRequestDto.tenantId,
            marketplace: syncRequestDto.marketplace,
            channelId: channelId,
            type: JobTypes.FETCH_ORDERS,
          },
          jobId,
        );
        return jobId;
      });

      const results = await Promise.allSettled(promises);
      for (const result of results) {
        if (result.status === 'fulfilled') {
          jobIds.push(result.value);
        }
      }
    }

    return {
      message: 'Order synchronization jobs accepted',
      jobIds,
    };
  }

  @Post('products')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger product synchronization manually' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Product sync job created',
  })
  async syncProducts(@Body() syncRequestDto: SyncRequestDto) {
    const jobIds: string[] = [];
    const BATCH_SIZE = 50;

    for (let i = 0; i < syncRequestDto.channelIds.length; i += BATCH_SIZE) {
      const batch = syncRequestDto.channelIds.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (channelId) => {
        const jobId = uuidv4();
        await this.queueService.addSyncJob(
          JobTypes.FETCH_PRODUCTS,
          {
            tenantId: syncRequestDto.tenantId,
            marketplace: syncRequestDto.marketplace,
            channelId: channelId,
            type: JobTypes.FETCH_PRODUCTS,
          },
          jobId,
        );
        return jobId;
      });

      const results = await Promise.allSettled(promises);
      for (const result of results) {
        if (result.status === 'fulfilled') {
          jobIds.push(result.value);
        }
      }
    }

    return {
      message: 'Product synchronization jobs accepted',
      jobIds,
    };
  }
}
