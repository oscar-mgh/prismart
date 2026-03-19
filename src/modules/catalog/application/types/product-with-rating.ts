import { Product } from '../../domain/entities/product.entity';

export interface ProductWithRating {
  product: Product;
  averageRating: number | null;
}
