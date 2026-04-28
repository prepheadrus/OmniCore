/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './app/filters/all-exceptions.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Enable cookie parser
  app.use(cookieParser());

  // Enable global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'x-channel-id', 'x-sales-channel-id'],
    credentials: true,
  });

  // Configure Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Omnicore API')
    .setDescription('The core API for Omnicore platform')
    .setVersion('1.0')
    .addTag('AI Agents')
    .addTag('Queue Management')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(
    `📚 Swagger Documentation is available at: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
