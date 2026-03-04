import { ForbiddenException, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/domain.exceptions';
import { ReviewRepositoryPort } from '../../domain/ports/review-repository.port';
import { DeleteReviewCommand } from './commands/delete-review.command';

@Injectable()
export class DeleteReviewUseCase {
  constructor(private readonly reviewRepository: ReviewRepositoryPort) {}

  async execute(command: DeleteReviewCommand, userId: string): Promise<void> {
    const review = await this.reviewRepository.findById(command.id);
    if (!review) {
      throw new EntityNotFoundException('Review', command.id);
    }

    if (review.userId.getValue() !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewRepository.delete(command.id);
  }
}
