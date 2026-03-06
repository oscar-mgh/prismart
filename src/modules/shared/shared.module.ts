import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EntityFinderService } from './application/services/entity-finder.service';
import { ImageStoragePort } from './domain/ports/image-storage.port';
import { CloudinaryAdapter } from './infrastructure/adapters/cloudinary.adapter';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    EntityFinderService,
    {
      provide: ImageStoragePort,
      useClass: CloudinaryAdapter,
    },
  ],
  exports: [EntityFinderService, ImageStoragePort],
})
export class SharedModule {}
