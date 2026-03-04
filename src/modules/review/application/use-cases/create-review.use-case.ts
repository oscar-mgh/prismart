import { Injectable } from '@nestjs/common';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { BusinessRuleViolationException } from 'src/modules/shared/domain/exceptions/domain.exceptions';
import { Review } from '../../domain/entities/review.entity';
import { ReviewRating } from '../../domain/value-objects/review-rating.vo';
import { ReviewRepositoryPort } from '../../domain/ports/review-repository.port';
import { CatalogIntegrationPort } from '../../domain/ports/catalog-integration.port';
import { CreateReviewCommand } from './commands/create-review.command';

@Injectable()
export class CreateReviewUseCase {
  constructor(
    private readonly reviewRepository: ReviewRepositoryPort,
    private readonly catalogIntegration: CatalogIntegrationPort,
  ) {}

  async execute(command: CreateReviewCommand, userId: string): Promise<Review> {
    const { productId, title, description, rating, reviewImage } = command;

    const productExists = await this.catalogIntegration.productExists(productId);
    if (!productExists) {
      throw new BusinessRuleViolationException(`Product with ID "${productId}" does not exist`);
    }

    const existingReview = await this.reviewRepository.findByUserAndProduct(userId, productId);
    if (existingReview) {
      throw new BusinessRuleViolationException(
        'You have already reviewed this product. You can update or delete your existing review.',
      );
    }

    const review = new Review(
      Id.create(),
      new Id(productId),
      new Id(userId),
      title,
      description,
      new ReviewRating(rating),
      reviewImage,
    );

    return this.reviewRepository.save(review);
  }
}
