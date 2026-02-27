import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserRepositoryPort } from 'src/modules/auth/domain/ports/user-repository.port';
import { AuthModule } from 'src/modules/auth/infrastructure/auth.module';
import { StoreIntegrationPort } from 'src/modules/catalog/domain/ports/store-integration.port';
import { EntityFinderService } from 'src/modules/shared/application/services/entity-finder.service';
import { SharedModule } from 'src/modules/shared/shared.module';
import { StoreIntegrationAdapter } from 'src/modules/store/infrastructure/adapters/store-integration.adapter';
import { MongooseStoreRepository } from 'src/modules/store/infrastructure/persistence/repositories/mongoose-store.repository';
import { CreateStoreUseCase } from '../application/use-cases/create-store.use-case';
import { DeleteStoreUseCase } from '../application/use-cases/delete-store.use-case';
import { FindStoreByIdUseCase } from '../application/use-cases/find-store-by-id.use-case';
import { UpdateStoreUseCase } from '../application/use-cases/update-store.use-case';
import { StoreRepositoryPort } from '../domain/ports/store-repository.port';
import { StoreController } from './controllers/store.controller';
import { StoreDocument, StoreSchema } from './persistence/entities/store.schema';

const useCases = [
  {
    provide: CreateStoreUseCase,
    inject: [StoreRepositoryPort, UserRepositoryPort],
    useFactory: (repo: StoreRepositoryPort, userRepo: UserRepositoryPort) => new CreateStoreUseCase(repo, userRepo),
  },
  {
    provide: FindStoreByIdUseCase,
    inject: [StoreRepositoryPort, EntityFinderService],
    useFactory: (repo: StoreRepositoryPort, finderService: EntityFinderService) =>
      new FindStoreByIdUseCase(repo, finderService),
  },
  {
    provide: DeleteStoreUseCase,
    inject: [StoreRepositoryPort, EntityFinderService],
    useFactory: (repo: StoreRepositoryPort, finder: EntityFinderService) => new DeleteStoreUseCase(repo, finder),
  },
  {
    provide: UpdateStoreUseCase,
    inject: [StoreRepositoryPort, EntityFinderService],
    useFactory: (repo: StoreRepositoryPort, finderService: EntityFinderService) =>
      new UpdateStoreUseCase(repo, finderService),
  },
];

@Module({
  imports: [MongooseModule.forFeature([{ name: StoreDocument.name, schema: StoreSchema }]), AuthModule, SharedModule],
  providers: [
    ...useCases,
    {
      provide: StoreRepositoryPort,
      useClass: MongooseStoreRepository,
    },
    {
      provide: StoreIntegrationPort,
      useClass: StoreIntegrationAdapter,
    },
  ],
  controllers: [StoreController],
  exports: [StoreIntegrationPort, StoreRepositoryPort],
})
export class StoreModule {}
