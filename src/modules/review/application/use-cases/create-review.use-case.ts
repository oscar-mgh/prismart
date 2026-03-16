import { Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from 'src/modules/shared/domain/exceptions/domain.exceptions';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { IdGenerator } from 'src/modules/shared/infrastructure/id-generator.service';
import { Review } from '../../domain/entities/review.entity';
import { ProductValidationPort } from '../../domain/ports/product-validation.port';
import { ReviewRepositoryPort } from '../../domain/ports/review-repository.port';
import { ReviewRating } from '../../domain/value-objects/review-rating.vo';
import { CreateReviewCommand } from './commands/create-review.command';

@Injectable()
export class CreateReviewUseCase {
  constructor(
    private readonly reviewRepository: ReviewRepositoryPort,
    private readonly catalogIntegration: ProductValidationPort,
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
      Id.fromString(IdGenerator.next().getValue()),
      Id.fromString(productId),
      Id.fromString(userId),
      title,
      description,
      new ReviewRating(rating),
      reviewImage,
    );

    return this.reviewRepository.save(review);
  }
}
