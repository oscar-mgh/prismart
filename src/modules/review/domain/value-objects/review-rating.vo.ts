export class ReviewRating {
  private static readonly VALID_RATINGS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  private readonly value: number;

  constructor(value: number) {
    if (!ReviewRating.VALID_RATINGS.includes(value)) {
      throw new Error(
        `Invalid rating: ${value}. Valid ratings are: ${ReviewRating.VALID_RATINGS.join(', ')}`,
      );
    }
    this.value = value;
  }

  public getValue(): number {
    return this.value;
  }

  public equals(other: ReviewRating): boolean {
    return this.value === other.getValue();
  }
}
