export interface ProductStockInfo {
  productId: string;
  name: string;
  price: number;
  availableStock: number;
}

export abstract class CatalogIntegrationPort {
  abstract getProductsInfo(productIds: string[]): Promise<ProductStockInfo[]>;

  abstract updateStockAndPurchaseCount(productId: string, quantity: number, session?: any): Promise<boolean>;
}
