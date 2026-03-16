import { Injectable } from '@nestjs/common';
import { ProductRepositoryPort } from 'src/modules/catalog/domain/ports/product-repository.port';
import { ProductValidationPort } from '../../domain/ports/product-validation.port';

@Injectable()
export class ProductValidationAdapter implements ProductValidationPort {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async productExists(productId: string): Promise<boolean> {
    const product = await this.productRepository.findById(productId);
    return product !== null;
  }
}
