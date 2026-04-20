import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { TrendyolAdapter } from './trendyol.adapter';

describe('TrendyolAdapter', () => {
  let adapter: TrendyolAdapter;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'TRENDYOL_API_KEY') return 'test-api-key';
      if (key === 'TRENDYOL_API_SECRET') return 'test-api-secret';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrendyolAdapter,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    adapter = module.get<TrendyolAdapter>(TrendyolAdapter);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset config mock for each test
    (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'TRENDYOL_API_KEY') return 'test-api-key';
      if (key === 'TRENDYOL_API_SECRET') return 'test-api-secret';
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('getBrands', () => {
    it('should fetch brands successfully', async () => {
      const mockResponse = {
        data: {
          brands: [
            { id: 1, name: 'Brand A' },
            { id: 2, name: 'Brand B' },
          ],
        },
      };

      (mockHttpService.get as jest.Mock).mockReturnValue(of(mockResponse));

      const result = await adapter.getBrands();

      const expectedAuthHeader = `Basic ${Buffer.from('test-api-key:test-api-secret').toString('base64')}`;

      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://api.trendyol.com/sapigw/brands',
        {
          headers: {
            Authorization: expectedAuthHeader,
          },
        },
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error if API credentials are not configured', async () => {
      (mockConfigService.get as jest.Mock).mockImplementation(() => null);

      await expect(adapter.getBrands()).rejects.toThrow('Trendyol API credentials are not configured');
    });

    it('should throw error if HTTP request fails', async () => {
      const error = new Error('HTTP Error');
      (mockHttpService.get as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await expect(adapter.getBrands()).rejects.toThrow('HTTP Error');
    });
  });
});
