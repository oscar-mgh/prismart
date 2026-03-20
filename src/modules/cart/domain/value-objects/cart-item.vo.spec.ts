import { CartItem } from './cart-item.vo';

describe('CartItem Value Object', () => {
  it('should create a valid cart item', () => {
    const item = new CartItem('prod-1', 5);
    expect(item.getProductId()).toBe('prod-1');
    expect(item.getQuantity()).toBe(5);
  });

  it('should throw if quantity is zero', () => {
    expect(() => new CartItem('prod-1', 0)).toThrow('Quantity must be at least 1');
  });

  it('should throw if quantity is negative', () => {
    expect(() => new CartItem('prod-1', -3)).toThrow('Quantity must be at least 1');
  });

  it('should create a new instance with withQuantity', () => {
    const item = new CartItem('prod-1', 2);
    const updated = item.withQuantity(5);
    expect(updated.getQuantity()).toBe(5);
    expect(item.getQuantity()).toBe(2); // original unchanged
  });
});
