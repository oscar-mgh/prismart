import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './modules/shared/infrastructure/filters/domain-exception.filter';
import { HttpExceptionFilter } from './modules/shared/infrastructure/filters/http-exception.filter';
import { LoggerInterceptor } from './modules/shared/infrastructure/interceptors/logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT') ?? 3000;
  const corsOrigin = configService.get<string>('CORS_ORIGIN') ?? '*';

  app.use(helmet());
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

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  await app.listen(port);
}
bootstrap();
