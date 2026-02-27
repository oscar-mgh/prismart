import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/infrastructure/auth.module';
import { CatalogModule } from 'src/modules/catalog/infrastructure/catalog.module';
import { StoreModule } from 'src/modules/store/infrastructure/store.module';
import { SeedService } from '../application/seed.service';
import { SeedController } from './seed.controller';

@Module({
  imports: [StoreModule, CatalogModule, AuthModule],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule {}
