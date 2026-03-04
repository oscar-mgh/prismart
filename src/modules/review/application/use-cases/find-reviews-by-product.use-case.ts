import { Injectable } from '@nestjs/common';
import { Page } from 'src/modules/shared/pagination/page.model';
import { Review } from '../../domain/entities/review.entity';
import { ReviewRepositoryPort } from '../../domain/ports/review-repository.port';
import { FindReviewsByProductQuery } from './queries/find-reviews-by-product.query';

@Injectable()
export class FindReviewsByProductUseCase {
  constructor(private readonly reviewRepository: ReviewRepositoryPort) {}

  async execute(query: FindReviewsByProductQuery): Promise<Page<Review>> {
    const { productId, page, limit } = query;
    return this.reviewRepository.findByProductId(productId, page, limit);
  }
}
