import { Injectable } from '@nestjs/common';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { IdGenerator } from 'src/modules/shared/infrastructure/id-generator.service';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { ProductDiscount } from '../../domain/value-objects/product-discount.vo';
import { Sku } from '../../domain/value-objects/sku.vo';
import { CreateProductCommand } from './commands/create-product.command';

@Injectable()
export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(command: CreateProductCommand, storeId: string): Promise<Product> {
    const { sku, name, description, price, stock, category, purchaseCount, discount } = command;

    let discountData: ProductDiscount | undefined;

    if (discount) {
      const { code, percentage, expirationDate } = discount;
      discountData = new ProductDiscount(code, percentage, expirationDate);
    }

    const product = new Product(
      Id.fromString(IdGenerator.next().getValue()),
      Id.fromString(storeId),
      new Sku(sku),
      name,
      description,
      price,
      stock,
      category,
      true,
      purchaseCount ?? 0,
      discountData,
    );

    return this.productRepository.save(product);
  }
}
