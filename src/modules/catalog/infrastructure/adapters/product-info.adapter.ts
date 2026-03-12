import { Injectable } from '@nestjs/common';
import { ProductRepositoryPort } from 'src/modules/catalog/domain/ports/product-repository.port';
import { ProductInfo, ProductInfoPort } from '../../domain/ports/product-info.port';

@Injectable()
export class ProductInfoAdapter implements ProductInfoPort {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async getProductsInfo(productIds: string[]): Promise<ProductInfo[]> {
    const products = await Promise.all(productIds.map((id) => this.productRepository.findById(id)));

    return products
      .filter((p) => p !== null)
      .map((p) => ({
        productId: p.id.toString(),
        name: p.getName(),
        price: p.getPrice(),
        availableStock: p.getStock(),
      }));
  }
}
