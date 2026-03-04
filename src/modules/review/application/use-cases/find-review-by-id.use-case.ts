import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/domain.exceptions';
import { Review } from '../../domain/entities/review.entity';
import { ReviewRepositoryPort } from '../../domain/ports/review-repository.port';
import { FindReviewByIdQuery } from './queries/find-review-by-id.query';

@Injectable()
export class FindReviewByIdUseCase {
  constructor(private readonly reviewRepository: ReviewRepositoryPort) {}

  async execute(query: FindReviewByIdQuery): Promise<Review> {
    const review = await this.reviewRepository.findById(query.id);
    if (!review) {
      throw new EntityNotFoundException('Review', query.id);
    }
    return review;
  }
}
