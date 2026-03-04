import { Page } from 'src/modules/shared/pagination/page.model';
import { Review } from '../entities/review.entity';

export abstract class ReviewRepositoryPort {
  abstract save(review: Review): Promise<Review>;

  abstract saveMany(reviews: Review[]): Promise<void>;

  abstract findById(id: string): Promise<Review | null>;

  abstract findByProductId(productId: string, page: number, limit: number): Promise<Page<Review>>;

  abstract findByUserAndProduct(userId: string, productId: string): Promise<Review | null>;

  abstract delete(id: string): Promise<void>;

  abstract getAverageRating(productId: string): Promise<number | null>;

  abstract getAverageRatings(productIds: string[]): Promise<Map<string, number | null>>;
}
