import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { ReviewRating } from '../value-objects/review-rating.vo';

export class Review {
  constructor(
    public readonly id: Id,
    public readonly productId: Id,
    public readonly userId: Id,
    private title: string,
    private description: string,
    private rating: ReviewRating,
    private reviewImage?: string,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.title.length < 4) {
      throw new Error('Review title must be at least 4 characters long');
    }
    if (this.description.length < 30) {
      throw new Error('Review description must be at least 30 characters long');
    }
  }

  public getTitle(): string {
    return this.title;
  }

  public getDescription(): string {
    return this.description;
  }

  public getRating(): ReviewRating {
    return this.rating;
  }

  public getReviewImage(): string | undefined {
    return this.reviewImage;
  }

  public updateTitle(title: string): void {
    this.title = title;
    this.validate();
  }

  public updateDescription(description: string): void {
    this.description = description;
    this.validate();
  }

  public updateRating(rating: ReviewRating): void {
    this.rating = rating;
  }

  public updateReviewImage(image?: string): void {
    this.reviewImage = image;
  }
}
