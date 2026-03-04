import { Injectable } from '@nestjs/common';
import { ProductRepositoryPort } from 'src/modules/catalog/domain/ports/product-repository.port';
import { CatalogIntegrationPort } from '../../domain/ports/catalog-integration.port';

@Injectable()
export class CatalogIntegrationAdapter extends CatalogIntegrationPort {
  constructor(private readonly productRepository: ProductRepositoryPort) {
    super();
  }

  async productExists(productId: string): Promise<boolean> {
    const product = await this.productRepository.findById(productId);
    return product !== null;
  }
}
