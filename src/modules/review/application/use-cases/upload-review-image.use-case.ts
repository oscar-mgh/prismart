import { ForbiddenException, Injectable } from '@nestjs/common';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/domain.exceptions';
import { ImageStoragePort } from 'src/modules/shared/domain/ports/image-storage.port';
import { Review } from '../../domain/entities/review.entity';
import { ReviewRepositoryPort } from '../../domain/ports/review-repository.port';
import { UploadReviewImageCommand } from './commands/upload-review-image.command';

@Injectable()
export class UploadReviewImageUseCase {
  constructor(
    private readonly reviewRepository: ReviewRepositoryPort,
    private readonly imageStorage: ImageStoragePort,
  ) {}

  async execute(command: UploadReviewImageCommand, userId: string): Promise<Review> {
    const { reviewId, file } = command;

    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new EntityNotFoundException('Review', reviewId);
    }

    if (review.userId.getValue() !== userId) {
      throw new ForbiddenException('You can only upload images to your own reviews');
    }

    const { url } = await this.imageStorage.upload(file, 'reviews');

    review.updateReviewImage(url);

    return this.reviewRepository.save(review);
  }
}
