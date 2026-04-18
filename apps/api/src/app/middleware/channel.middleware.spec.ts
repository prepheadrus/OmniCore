import { Test, TestingModule } from '@nestjs/testing';
import { ChannelMiddleware } from './channel.middleware';
import { ClsService } from 'nestjs-cls';
import { Request, Response } from 'express';

describe('ChannelMiddleware', () => {
  let middleware: ChannelMiddleware;
  let clsService: ClsService;

  beforeEach(async () => {
    const clsMock = {
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelMiddleware,
        {
          provide: ClsService,
          useValue: clsMock,
        },
      ],
    }).compile();

    middleware = module.get<ChannelMiddleware>(ChannelMiddleware);
    clsService = module.get<ClsService>(ClsService);
  });

  it('should set channel_id from header (x-channel-id)', () => {
    const req = {
      headers: {
        'x-channel-id': 'test-channel-header',
      },
      query: {},
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(clsService.set).toHaveBeenCalledWith('app.channel_id', 'test-channel-header');
    expect(next).toHaveBeenCalled();
  });

  it('should set channel_id from legacy header (x-sales-channel-id) when x-channel-id is absent', () => {
    const req = {
      headers: {
        'x-sales-channel-id': 'test-legacy-header',
      },
      query: {},
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(clsService.set).toHaveBeenCalledWith('app.channel_id', 'test-legacy-header');
    expect(next).toHaveBeenCalled();
  });

  it('should set channel_id from query (channelId) when headers are absent', () => {
    const req = {
      headers: {},
      query: {
        channelId: 'test-channel-query1',
      },
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(clsService.set).toHaveBeenCalledWith('app.channel_id', 'test-channel-query1');
    expect(next).toHaveBeenCalled();
  });

  it('should set channel_id from query (channel_id) when headers and channelId are absent', () => {
    const req = {
      headers: {},
      query: {
        channel_id: 'test-channel-query2',
      },
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(clsService.set).toHaveBeenCalledWith('app.channel_id', 'test-channel-query2');
    expect(next).toHaveBeenCalled();
  });

  it('should set channel_id to undefined if no valid headers or query params exist', () => {
    const req = {
      headers: {},
      query: {},
    } as unknown as Request;
    const res = {} as Response;
    const next = jest.fn();

    middleware.use(req, res, next);

    expect(clsService.set).toHaveBeenCalledWith('app.channel_id', undefined);
    expect(next).toHaveBeenCalled();
  });
});
