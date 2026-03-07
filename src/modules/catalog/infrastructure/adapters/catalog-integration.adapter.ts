import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductRepositoryPort } from 'src/modules/catalog/domain/ports/product-repository.port';
import { ProductDocument } from 'src/modules/catalog/infrastructure/persistence/entities/product.schema';
import { CatalogIntegrationPort, ProductStockInfo } from '../../../order/domain/ports/catalog-integration.port';

@Injectable()
export class CatalogIntegrationAdapter implements CatalogIntegrationPort {
  constructor(
    private readonly productRepository: ProductRepositoryPort,
    @InjectModel(ProductDocument.name) private readonly productModel: Model<ProductDocument>,
  ) {}

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

  async updateStockAndPurchaseCount(productId: string, quantity: number, session?: any): Promise<boolean> {
    const result = await this.productModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(productId),
        stock: { $gte: Number(quantity) },
      },
      {
        $inc: {
          stock: -Number(quantity),
          purchaseCount: Number(quantity),
        },
      },
      { session, new: true },
    );

    return !!result;
  }
}
