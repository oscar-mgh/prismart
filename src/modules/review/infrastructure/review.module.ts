import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/modules/auth/infrastructure/auth.module';
import { CatalogModule } from 'src/modules/catalog/infrastructure/catalog.module';
import { CreateReviewUseCase } from '../application/use-cases/create-review.use-case';
import { DeleteReviewUseCase } from '../application/use-cases/delete-review.use-case';
import { FindReviewByIdUseCase } from '../application/use-cases/find-review-by-id.use-case';
import { FindReviewsByProductUseCase } from '../application/use-cases/find-reviews-by-product.use-case';
import { UpdateReviewUseCase } from '../application/use-cases/update-review.use-case';
import { CatalogIntegrationPort } from '../domain/ports/catalog-integration.port';
import { ReviewRepositoryPort } from '../domain/ports/review-repository.port';
import { CatalogIntegrationAdapter } from './adapters/catalog-integration.adapter';
import { ReviewController } from './controllers/review.controller';
import { ReviewDocument, ReviewSchema } from './persistence/entities/review.schema';
import { MongooseReviewRepository } from './persistence/repositories/mongoose-review.repository';

const useCases = [
  {
    provide: CreateReviewUseCase,
    inject: [ReviewRepositoryPort, CatalogIntegrationPort],
    useFactory: (repo: ReviewRepositoryPort, catalogIntegration: CatalogIntegrationPort) =>
      new CreateReviewUseCase(repo, catalogIntegration),
  },
  {
    provide: UpdateReviewUseCase,
    inject: [ReviewRepositoryPort],
    useFactory: (repo: ReviewRepositoryPort) => new UpdateReviewUseCase(repo),
  },
  {
    provide: DeleteReviewUseCase,
    inject: [ReviewRepositoryPort],
    useFactory: (repo: ReviewRepositoryPort) => new DeleteReviewUseCase(repo),
  },
  {
    provide: FindReviewsByProductUseCase,
    inject: [ReviewRepositoryPort],
    useFactory: (repo: ReviewRepositoryPort) => new FindReviewsByProductUseCase(repo),
  },
  {
    provide: FindReviewByIdUseCase,
    inject: [ReviewRepositoryPort],
    useFactory: (repo: ReviewRepositoryPort) => new FindReviewByIdUseCase(repo),
  },
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ReviewDocument.name, schema: ReviewSchema }]),
    AuthModule,
    forwardRef(() => CatalogModule),
  ],
  providers: [
    {
      provide: ReviewRepositoryPort,
      useClass: MongooseReviewRepository,
    },
    {
      provide: CatalogIntegrationPort,
      useClass: CatalogIntegrationAdapter,
    },
    ...useCases,
  ],
  controllers: [ReviewController],
  exports: [ReviewRepositoryPort],
})
export class ReviewModule {}
