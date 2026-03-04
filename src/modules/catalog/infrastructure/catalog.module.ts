import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/modules/auth/infrastructure/auth.module';
import { EntityFinderService } from 'src/modules/shared/application/services/entity-finder.service';
import { StoreModule } from 'src/modules/store/infrastructure/store.module';
import { ReviewModule } from 'src/modules/review/infrastructure/review.module';
import { ApplyDiscountUseCase } from '../application/use-cases/apply-discount.use-case';
import { CreateProductUseCase } from '../application/use-cases/create-product.use-case';
import { DeleteProductUseCase } from '../application/use-cases/delete-product.use-case';
import { FindAllProductsUseCase } from '../application/use-cases/find-all-products.use-case';
import { FindByCriteriaUseCase } from '../application/use-cases/find-by-criteria-use-case';
import { FindProductByIdUseCase } from '../application/use-cases/find-product-by-id.use-case';
import { ProductRepositoryPort } from '../domain/ports/product-repository.port';
import { ReviewIntegrationPort } from '../domain/ports/review-integration.port';
import { ProductController } from './controllers/product.controller';
import { ReviewIntegrationAdapter } from './adapters/review-integration.adapter';
import { ProductDocument, ProductSchema } from './persistence/entities/product.schema';
import { MongooseProductRepository } from './persistence/repositories/mongoose-product.repository';

const useCases = [
  {
    provide: CreateProductUseCase,
    inject: [ProductRepositoryPort],
    useFactory: (repo: ProductRepositoryPort) => new CreateProductUseCase(repo),
  },
  {
    provide: DeleteProductUseCase,
    inject: [ProductRepositoryPort, EntityFinderService],
    useFactory: (repo: ProductRepositoryPort, finder: EntityFinderService) => new DeleteProductUseCase(repo, finder),
  },
  {
    provide: FindAllProductsUseCase,
    inject: [ProductRepositoryPort],
    useFactory: (repo: ProductRepositoryPort) => new FindAllProductsUseCase(repo),
  },
  {
    provide: FindProductByIdUseCase,
    inject: [ProductRepositoryPort, EntityFinderService],
    useFactory: (repo: ProductRepositoryPort, finder: EntityFinderService) => new FindProductByIdUseCase(repo, finder),
  },
  {
    provide: ApplyDiscountUseCase,
    inject: [ProductRepositoryPort],
    useFactory: (repo: ProductRepositoryPort) => new ApplyDiscountUseCase(repo),
  },
  {
    provide: FindByCriteriaUseCase,
    inject: [ProductRepositoryPort],
    useFactory: (repo: ProductRepositoryPort) => new FindByCriteriaUseCase(repo),
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProductDocument.name, schema: ProductSchema }]),
    AuthModule,
    StoreModule,
    forwardRef(() => ReviewModule),
  ],
  providers: [
    {
      provide: ProductRepositoryPort,
      useClass: MongooseProductRepository,
    },
    {
      provide: ReviewIntegrationPort,
      useClass: ReviewIntegrationAdapter,
    },
    ...useCases,
  ],
  controllers: [ProductController],
  exports: [ProductRepositoryPort],
})
export class CatalogModule {}
