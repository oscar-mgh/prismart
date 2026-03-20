import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogModule } from 'src/modules/catalog/infrastructure/catalog.module';
import { ProductDocument, ProductSchema } from 'src/modules/catalog/infrastructure/persistence/entities/product.schema';
import { CatalogIntegrationAdapter } from '../../catalog/infrastructure/adapters/catalog-integration.adapter';
import { CancelOrderUseCase } from '../application/use-cases/cancel-order.use-case';
import { CreateOrderUseCase } from '../application/use-cases/create-order.use-case';
import { GetAllCustomerOrdersUseCase } from '../application/use-cases/get-all-customers-orders.use-case';
import { GetCustomerOrdersUseCase } from '../application/use-cases/get-customer-orders.use-case';
import { GetOrderUseCase } from '../application/use-cases/get-order.use-case';
import { CatalogIntegrationPort } from '../domain/ports/catalog-integration.port';
import { OrderRepositoryPort } from '../domain/ports/order-repository.port';
import { OrderController } from './controllers/order.controller';
import { MongooseOrderRepository } from './persistence/repositories/mongoose-order.repository';
import { OrderDocument, OrderSchema } from './persistence/schemas/order.schema';

const useCases = [
  {
    provide: CreateOrderUseCase,
    useFactory: (repo: OrderRepositoryPort, catalog: CatalogIntegrationPort) => new CreateOrderUseCase(repo, catalog),
    inject: [OrderRepositoryPort, CatalogIntegrationPort],
  },
  {
    provide: GetCustomerOrdersUseCase,
    useFactory: (repo: OrderRepositoryPort) => new GetCustomerOrdersUseCase(repo),
    inject: [OrderRepositoryPort],
  },
  {
    provide: GetOrderUseCase,
    useFactory: (repo: OrderRepositoryPort) => new GetOrderUseCase(repo),
    inject: [OrderRepositoryPort],
  },
  {
    provide: CancelOrderUseCase,
    useFactory: (repo: OrderRepositoryPort, catalog: CatalogIntegrationPort) => new CancelOrderUseCase(repo, catalog),
    inject: [OrderRepositoryPort, CatalogIntegrationPort],
  },
  {
    provide: GetAllCustomerOrdersUseCase,
    useFactory: (repo: OrderRepositoryPort) => new GetAllCustomerOrdersUseCase(repo),
    inject: [OrderRepositoryPort],
  },
];

@Module({
  imports: [
    CatalogModule,
    MongooseModule.forFeature([
      { name: OrderDocument.name, schema: OrderSchema },
      { name: ProductDocument.name, schema: ProductSchema },
    ]),
  ],
  providers: [
    ...useCases,
    { provide: OrderRepositoryPort, useClass: MongooseOrderRepository },
    { provide: CatalogIntegrationPort, useClass: CatalogIntegrationAdapter },
  ],
  controllers: [OrderController],
  exports: [OrderRepositoryPort, CatalogIntegrationPort, CreateOrderUseCase],
})
export class OrderModule {}
