import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { ErpnextService } from './erpnext.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: false,
      validationSchema: Joi.object({
        ERPNEXT_URL: Joi.string().uri().required(),
        ERPNEXT_API_KEY: Joi.string().required(),
        ERPNEXT_API_SECRET: Joi.string().required(),
      }),
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const apiKey = configService.get<string>('ERPNEXT_API_KEY');
        const apiSecret = configService.get<string>('ERPNEXT_API_SECRET');
        return {
          baseURL: configService.get<string>('ERPNEXT_URL'),
          headers: {
            Authorization: `token ${apiKey}:${apiSecret}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [ErpnextService],
  exports: [ErpnextService],
})
export class ErpnextClientModule {}
