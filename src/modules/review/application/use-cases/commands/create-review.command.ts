export interface CreateReviewCommand {
  productId: string;
  title: string;
  description: string;
  rating: number;
  reviewImage?: string;
}
