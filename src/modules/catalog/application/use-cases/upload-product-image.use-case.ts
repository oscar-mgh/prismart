import { Injectable } from '@nestjs/common';
import { EntityFinderService } from 'src/modules/shared/application/services/entity-finder.service';
import { ImageStoragePort } from 'src/modules/shared/domain/ports/image-storage.port';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { UploadProductImageCommand } from './commands/upload-product-image.command';

@Injectable()
export class UploadProductImageUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryPort,
    private readonly entityFinder: EntityFinderService,
    private readonly imageStorage: ImageStoragePort,
  ) {}

  async execute(command: UploadProductImageCommand): Promise<Product> {
    const { productId, file } = command;

    const product = await this.entityFinder.findOrThrow(
      this.productRepository,
      productId,
      'Product',
    );

    const { url } = await this.imageStorage.upload(file, 'products');

    product.updateProductImage(url);

    return this.productRepository.save(product);
  }
}
