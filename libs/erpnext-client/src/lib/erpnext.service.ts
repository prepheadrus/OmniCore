import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { CreateSupplierDto, CreatePurchaseOrderDto, CreatePurchaseReceiptDto } from './dto';

@Injectable()
export class ErpnextService {
  private readonly logger = new Logger(ErpnextService.name);

  constructor(
    private readonly httpService: HttpService,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createSupplier(data: CreateSupplierDto): Promise<any> {
    const url = '/api/resource/Supplier';
    this.logger.debug(`Creating Supplier in ERPNext`);

    const request = this.httpService.post(url, data).pipe(
      catchError((error) => {
        this.logger.error(`Error creating Supplier: ${error.message} - Response: ${JSON.stringify(error.response?.data)}`);
        throw error;
      }),
    );

    const response = await firstValueFrom(request);
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createPurchaseOrder(data: CreatePurchaseOrderDto): Promise<any> {
    const url = '/api/resource/Purchase Order';
    this.logger.debug(`Creating Purchase Order in ERPNext`);

    // Convert dates to string if necessary, assuming ERPNext accepts standard ISO strings or YYYY-MM-DD
    const payload = {
        ...data,
        transaction_date: data.transaction_date instanceof Date ? data.transaction_date.toISOString().split('T')[0] : data.transaction_date
    };

    const request = this.httpService.post(url, payload).pipe(
      catchError((error) => {
        this.logger.error(`Error creating Purchase Order: ${error.message} - Response: ${JSON.stringify(error.response?.data)}`);
        throw error;
      }),
    );

    const response = await firstValueFrom(request);
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createPurchaseReceipt(data: CreatePurchaseReceiptDto): Promise<any> {
    const url = '/api/resource/Purchase Receipt';
    this.logger.debug(`Creating Purchase Receipt in ERPNext`);

    const payload = {
        ...data,
        posting_date: data.posting_date instanceof Date ? data.posting_date.toISOString().split('T')[0] : data.posting_date
    };

    const request = this.httpService.post(url, payload).pipe(
      catchError((error) => {
        this.logger.error(`Error creating Purchase Receipt: ${error.message} - Response: ${JSON.stringify(error.response?.data)}`);
        throw error;
      }),
    );

    const response = await firstValueFrom(request);
    return response.data;
  }
}
