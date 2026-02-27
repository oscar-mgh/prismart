export interface CreateProductCommand {
  sku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  purchaseCount?: number;
  discount?: {
    code: string;
    percentage: number;
    expirationDate: Date;
  };
}
