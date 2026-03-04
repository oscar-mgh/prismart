import { ForbiddenException, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/domain.exceptions';
import { ReviewRating } from '../../domain/value-objects/review-rating.vo';
import { Review } from '../../domain/entities/review.entity';
import { ReviewRepositoryPort } from '../../domain/ports/review-repository.port';
import { UpdateReviewCommand } from './commands/update-review.command';

@Injectable()
export class UpdateReviewUseCase {
  constructor(private readonly reviewRepository: ReviewRepositoryPort) {}

  async execute(command: UpdateReviewCommand, userId: string): Promise<Review> {
    const { id, title, description, rating, reviewImage } = command;

    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new EntityNotFoundException('Review', id);
    }

    if (review.userId.getValue() !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    if (title !== undefined) review.updateTitle(title);
    if (description !== undefined) review.updateDescription(description);
    if (rating !== undefined) review.updateRating(new ReviewRating(rating));
    if (reviewImage !== undefined) review.updateReviewImage(reviewImage || undefined);

    return this.reviewRepository.save(review);
  }
}
