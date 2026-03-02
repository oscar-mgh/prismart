import { Injectable } from '@nestjs/common';
import { CatalogIntegrationPort, ProductStockInfo } from '../../domain/ports/catalog-integration.port';
import { ProductRepositoryPort } from 'src/modules/catalog/domain/ports/product-repository.port';

@Injectable()
export class CatalogIntegrationAdapter implements CatalogIntegrationPort {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async getProductsInfo(productIds: string[]): Promise<ProductStockInfo[]> {
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

  async updateStockAndPurchaseCount(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) return;

    const newStock = product.getStock() - quantity;
    product.updateStock(newStock);

    if (quantity > 0) {
      product.increasePurchaseCount(quantity);
    } else {
      product.decreasePurchaseCount(Math.abs(quantity));
    }

    await this.productRepository.save(product);
  }
}
