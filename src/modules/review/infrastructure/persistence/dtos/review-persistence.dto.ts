export interface ReviewPersistenceDto {
  readonly _id: string;
  readonly productId: string;
  readonly userId: string;
  readonly title: string;
  readonly description: string;
  readonly rating: number;
  readonly reviewImage?: string;
}
