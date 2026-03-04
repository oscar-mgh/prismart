export abstract class ReviewIntegrationPort {
  abstract getAverageRating(productId: string): Promise<number | null>;

  abstract getAverageRatings(productIds: string[]): Promise<Map<string, number | null>>;
}
