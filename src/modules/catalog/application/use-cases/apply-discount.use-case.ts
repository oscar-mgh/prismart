import { Injectable } from '@nestjs/common';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { ProductDiscount } from '../../domain/value-objects/product-discount.vo';
import { ApplyDiscountCommand } from './commands/apply-discount.command';

@Injectable()
export class ApplyDiscountUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(command: ApplyDiscountCommand): Promise<number> {
    const { criteria, discountData } = command;
    const { skus, ids, category } = criteria;
  
    const products = await this.productRepository.findByCriteria({ skus, ids, category });
  
    if (!products || products.length === 0) return 0;
  
    const { code, percentage, expirationDate } = discountData;
    
    for (const product of products) {
      const newDiscount = new ProductDiscount(code, percentage, expirationDate);
      product.applyDiscount(newDiscount);
    }
  
    await this.productRepository.saveMany(products);
  
    return products.length;
  }
}
