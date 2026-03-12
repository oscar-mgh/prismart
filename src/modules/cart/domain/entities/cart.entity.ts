import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { CartItem } from '../value-objects/cart-item.vo';

export class Cart {
  constructor(
    public readonly id: Id,
    private readonly userId: string,
    private items: CartItem[] = [],
    private active: boolean = true,
    private updatedAt: Date = new Date(),
  ) {}

  public getItems(): CartItem[] {
    return [...this.items];
  }

  public getUserId(): string {
    return this.userId;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getTotalItems(): number {
    return this.items.reduce((total, item) => total + item.getQuantity(), 0);
  }

  public isActive(): boolean {
    return this.active;
  }

  public updateProductQuantity(productId: string, newQuantity: number): void {
    if (newQuantity <= 0) {
      this.removeItem(productId);
      return;
    }

    const index = this.items.findIndex((item) => item.getProductId() === productId);

    if (index >= 0) {
      const currentQuantity = this.items[index].getQuantity();
      this.items[index] = new CartItem(productId, currentQuantity + newQuantity);
    } else {
      this.items.push(new CartItem(productId, newQuantity));
    }

    this.updatedAt = new Date();
  }

  public removeItem(productId: string): void {
    this.items = this.items.filter((item) => item.getProductId() !== productId);
    this.updatedAt = new Date();
  }

  public clear(): void {
    this.items = [];
    this.updatedAt = new Date();
  }
}
