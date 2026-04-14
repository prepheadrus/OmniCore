import { Module } from '@nestjs/common';
import { InvoiceAdapterFactory } from './factories/invoice-adapter.factory';

@Module({
	controllers: [],
	providers: [InvoiceAdapterFactory],
	exports: [InvoiceAdapterFactory],
})
export class InvoiceAdaptersModule {}
