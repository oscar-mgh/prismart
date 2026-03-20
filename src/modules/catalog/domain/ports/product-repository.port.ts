import { Page } from 'src/modules/shared/pagination/page.model';
import { Product } from '../entities/product.entity';

export interface ProductCriteria {
  ids?: string[];
  skus?: string[];
  category?: string;
  active?: boolean;
  page?: number;
  limit?: number;
  sortByPurchaseCount?: 'asc' | 'desc';
}

export type DiscountData = { code: string; percentage: number; expirationDate: Date };

export abstract class ProductRepositoryPort {
  abstract save(product: Product, session?: any): Promise<Product>;

  abstract saveMany(products: Product[]): Promise<void>;

  abstract findAll(page: number, limit: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<Page<Product>>;

  abstract findByCriteria(criteria: ProductCriteria): Promise<Page<Product>>;

  abstract findById(id: string, session?: any): Promise<Product | null>;

  abstract delete(id: string): Promise<void>;

  abstract applyDiscount(criteria: ProductCriteria, discountData: DiscountData): Promise<number>;

  abstract findAllCategories(): Promise<string[]>;
}
