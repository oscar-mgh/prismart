import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductInfoPort } from 'src/modules/catalog/domain/ports/product-info.port';
import { CatalogModule } from 'src/modules/catalog/infrastructure/catalog.module';
import { OrderModule } from 'src/modules/order/infrastructure/order.module';
import { EntityFinderService } from 'src/modules/shared/application/services/entity-finder.service';
import { AddToCartUseCase } from '../application/use-cases/add-to-cart.use-case';
import { CheckoutUseCase } from '../application/use-cases/checkout.use-case';
import { DeleteCartUseCase } from '../application/use-cases/delete-cart.use-case';
import { FindCartByUserIdUseCase } from '../application/use-cases/find-cart-by-user-id.use-case';
import { CartRepositoryPort } from '../domain/ports/cart-repository.port';
import { CheckoutPort } from '../domain/ports/checkout.port';
import { CheckoutAdapter } from './adapters/checkout.adapter';
import { CartController } from './controllers/cart.controller';
import { MongooseCartRepository } from './persistence/repositories/mongoose-cart.repository';
import { CartDocument, CartSchema } from './persistence/schemas/cart.schema';

const useCases = [
  {
    provide: AddToCartUseCase,
    inject: [CartRepositoryPort, ProductInfoPort],
    useFactory: (repo: CartRepositoryPort, productInfo: ProductInfoPort) => new AddToCartUseCase(repo, productInfo),
  },
  {
    provide: FindCartByUserIdUseCase,
    inject: [CartRepositoryPort, EntityFinderService],
    useFactory: (repo: CartRepositoryPort, finder: EntityFinderService) => new FindCartByUserIdUseCase(repo, finder),
  },
  {
    provide: DeleteCartUseCase,
    inject: [CartRepositoryPort, EntityFinderService],
    useFactory: (repo: CartRepositoryPort, finder: EntityFinderService) => new DeleteCartUseCase(repo, finder),
  },
  {
    provide: CheckoutUseCase,
    inject: [CartRepositoryPort, CheckoutPort],
    useFactory: (repo: CartRepositoryPort, checkoutPort: CheckoutPort) => new CheckoutUseCase(repo, checkoutPort),
  },
];

@Module({
  imports: [
    CatalogModule,
    OrderModule,
    MongooseModule.forFeature([
      {
        name: CartDocument.name,
        schema: CartSchema,
      },
    ]),
  ],
  providers: [
    ...useCases,
    {
      provide: CartRepositoryPort,
      useClass: MongooseCartRepository,
    },
    {
      provide: CheckoutPort,
      useClass: CheckoutAdapter,
    },
  ],
  controllers: [CartController],
  exports: [CartRepositoryPort],
})
export class CartModule {}

