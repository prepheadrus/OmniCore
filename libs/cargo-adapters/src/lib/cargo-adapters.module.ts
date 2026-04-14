import { Module } from '@nestjs/common';
import { CargoAdapterFactory } from './factories/cargo-adapter.factory';

@Module({
	controllers: [],
	providers: [CargoAdapterFactory],
	exports: [CargoAdapterFactory],
})
export class CargoAdaptersModule {}
