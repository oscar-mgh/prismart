export abstract class ProductValidationPort {
  abstract productExists(productId: string): Promise<boolean>;
}
