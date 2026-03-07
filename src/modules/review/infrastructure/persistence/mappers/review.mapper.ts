import { Review } from 'src/modules/review/domain/entities/review.entity';
import { ReviewRating } from 'src/modules/review/domain/value-objects/review-rating.vo';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { ReviewDocument } from '../entities/review.schema';
import { ReviewPersistenceDto } from '../dtos/review-persistence.dto';
import { ReviewResponseDto } from '../../http/dtos/review-response.dto';

export class ReviewMapper {
  static toDomain(raw: ReviewDocument): Review {
    return new Review(
      Id.fromString(raw._id.toString()),
      Id.fromString(raw.productId),
      Id.fromString(raw.userId),
      raw.title,
      raw.description,
      new ReviewRating(raw.rating),
      raw.reviewImage,
    );
  }

  static toPersistence(domain: Review): ReviewPersistenceDto {
    return {
      _id: domain.id.getValue(),
      productId: domain.productId.getValue(),
      userId: domain.userId.getValue(),
      title: domain.getTitle(),
      description: domain.getDescription(),
      rating: domain.getRating().getValue(),
      reviewImage: domain.getReviewImage(),
    };
  }

  static toResponse(review: Review): ReviewResponseDto {
    return {
      id: review.id.getValue(),
      productId: review.productId.getValue(),
      userId: review.userId.getValue(),
      title: review.getTitle(),
      description: review.getDescription(),
      rating: review.getRating().getValue(),
      reviewImage: review.getReviewImage(),
    };
  }
}
