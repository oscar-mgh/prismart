import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './modules/shared/infrastructure/filters/http-exception.filter';
import { DomainExceptionFilter } from './modules/shared/infrastructure/filters/domain-exception.filter';
import { LoggerInterceptor } from './modules/shared/infrastructure/interceptors/logger.interceptor';

async function bootstrap() {
  const port = process.env.API_PORT ?? 3000;
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggerInterceptor());

  await app.listen(port);
}
bootstrap();
