import { Page } from 'src/modules/shared/pagination/page.model';
import { Product } from '../entities/product.entity';

export interface ProductCriteria {
  ids?: string[];
  skus?: string[];
  category?: string;
}

export type DiscountData = { code: string; percentage: number; expirationDate: Date };

export abstract class ProductRepositoryPort {
  abstract save(product: Product): Promise<Product>;

  abstract saveMany(products: Product[]): Promise<void>;

  abstract findAll(page: number, limit: number): Promise<Page<Product>>;

  abstract findByCriteria(criteria: ProductCriteria): Promise<Product[]>;

  abstract findById(id: string): Promise<Product | null>;

  abstract delete(id: string): Promise<void>;

  abstract applyDiscount(criteria: ProductCriteria, discountData: DiscountData): Promise<number>;
}
