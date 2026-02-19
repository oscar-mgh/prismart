export interface ApplyDiscountCommand {
  criteria: {
    limit?: number;
    page?: number;
    ids?: string[];
    skus?: string[];
    category?: string;
  };
  discountData: { code: string; percentage: number; expirationDate: Date };
}
