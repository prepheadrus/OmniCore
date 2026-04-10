import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class ChannelMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const channelId = req.headers['x-sales-channel-id'];
    if (!channelId || typeof channelId !== 'string') {
      throw new BadRequestException('x-sales-channel-id header is required');
    }

    this.cls.set('app.channel_id', channelId);
    next();
  }
}
