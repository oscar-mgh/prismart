export interface ProductPersistenceDto {
  readonly _id: string;
  readonly storeId: string;
  readonly sku: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly stock: number;
  readonly active: boolean;
  readonly category: string;
  readonly purchaseCount: number;
  readonly productImage?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date | null;
  readonly discount?: {
    readonly code: string;
    readonly percentage: number;
    readonly isExpired: boolean;
    readonly expirationDate: Date;
  } | null;
}
