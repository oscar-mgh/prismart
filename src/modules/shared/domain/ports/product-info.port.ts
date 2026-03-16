export interface ProductInfo {
  productId: string;
  name: string;
  price: number;
  availableStock: number;
}

export abstract class ProductInfoPort {
  abstract getProductsInfo(productIds: string[]): Promise<ProductInfo[]>;
}
