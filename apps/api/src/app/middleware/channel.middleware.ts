import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class ChannelMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'OPTIONS') {
      return next();
    }

    const channelId = req.headers['x-channel-id'] ||
                      req.headers['x-sales-channel-id'] ||
                      req.cookies?.['channel-id'] ||
                      req.cookies?.['channelId'] ||
                      req.query.channelId ||
                      req.query.channel_id;

    this.cls.set('app.channel_id', channelId);
    next();
  }
}
