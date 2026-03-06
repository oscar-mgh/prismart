import { Sku } from 'src/modules/catalog/domain/value-objects/sku.vo';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { ProductDiscount } from '../value-objects/product-discount.vo';

export class Product {
  constructor(
    public readonly id: Id,
    public readonly storeId: Id,
    private sku: Sku,
    private name: string,
    private description: string,
    private price: number,
    private stock: number,
    private category: string,
    private active: boolean = true,
    private purchaseCount: number = 0,
    private discount?: ProductDiscount,
    private productImage?: string,
    private readonly createdAt: Date = new Date(),
    private readonly updatedAt: Date | null = null,
  ) {
    this.validate();
  }

  private validate() {
    if (this.name.length < 2 || this.name.length > 50) throw new Error('Invalid name length');
    if (this.price <= 0) throw new Error('Price must be positive');
    if (this.stock < 0) throw new Error('Stock cannot be negative');
  }

  public getStoreId(): Id {
    return this.storeId;
  }
  public getSku(): Sku {
    return this.sku;
  }
  public getName(): string {
    return this.name;
  }
  public getDescription(): string {
    return this.description;
  }
  public getStock(): number {
    return this.stock;
  }
  public isActive(): boolean {
    return this.active;
  }
  public getPrice(): number {
    return this.price;
  }
  public getCategory(): string {
    return this.category;
  }
  public getPurchaseCount(): number {
    return this.purchaseCount;
  }
  public getDiscount(): ProductDiscount | undefined {
    return this.discount;
  }
  public getCreatedAt(): Date {
    return this.createdAt;
  }
  public getUpdatedAt(): Date | null {
    return this.updatedAt;
  }

  public getProductImage(): string | undefined {
    return this.productImage;
  }

  public updateProductImage(url: string): void {
    this.productImage = url;
  }

  public getFinalPrice(): number {
    if (this.discount) {
      return this.price - this.discount.getDiscountAmount(this.price);
    }
    return this.price;
  }

  public activate(): void {
    this.active = true;
  }

  public deactivate(): void {
    this.active = false;
  }

  public updateStock(newQuantity: number) {
    if (newQuantity <= 0) throw new Error('Wrong stock quantity');
    this.stock = newQuantity;
  }

  public increasePurchaseCount(quantity: number) {
    this.purchaseCount += quantity;
  }

  public decreasePurchaseCount(quantity: number) {
    this.purchaseCount -= quantity;
  }

  public applyDiscount(discount: ProductDiscount): void {
    this.discount = discount;
  }

  public removeDiscount(): void {
    this.discount = undefined;
  }
}
