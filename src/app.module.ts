import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { CartModule } from './modules/cart/infrastructure/cart.module';
import { CatalogModule } from './modules/catalog/infrastructure/catalog.module';
import { HealthModule } from './modules/health/health.module';
import { OrderModule } from './modules/order/infrastructure/order.module';
import { SeedModule } from './modules/seed/infrastructure/seed.module';
import { SharedModule } from './modules/shared/shared.module';
import { StoreModule } from './modules/store/infrastructure/store.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI', 'mongodb://localhost:27017/prismart'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    CatalogModule,
    HealthModule,
    OrderModule,
    CartModule,
    StoreModule,
    SeedModule,
    SharedModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
