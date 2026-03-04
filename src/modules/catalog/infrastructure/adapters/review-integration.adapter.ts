import { Injectable } from '@nestjs/common';
import { ReviewRepositoryPort } from 'src/modules/review/domain/ports/review-repository.port';
import { ReviewIntegrationPort } from '../../domain/ports/review-integration.port';

@Injectable()
export class ReviewIntegrationAdapter extends ReviewIntegrationPort {
  constructor(private readonly reviewRepository: ReviewRepositoryPort) {
    super();
  }

  async getAverageRating(productId: string): Promise<number | null> {
    return this.reviewRepository.getAverageRating(productId);
  }

  async getAverageRatings(productIds: string[]): Promise<Map<string, number | null>> {
    return this.reviewRepository.getAverageRatings(productIds);
  }
}
