export abstract class CatalogIntegrationPort {
  abstract productExists(productId: string): Promise<boolean>;
}
