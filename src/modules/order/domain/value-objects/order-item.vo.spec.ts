import { OrderItem } from './order-item.vo';

describe('OrderItem Value Object', () => {
  it('should create a valid order item', () => {
    const item = new OrderItem('prod-1', 'Product A', 25.5, 2);
    expect(item.getProductId()).toBe('prod-1');
    expect(item.getProductName()).toBe('Product A');
    expect(item.getUnitPrice()).toBe(25.5);
    expect(item.getQuantity()).toBe(2);
  });

  it('should calculate total correctly', () => {
    const item = new OrderItem('prod-1', 'Product A', 25.5, 4);
    expect(item.getTotal()).toBe(102);
  });

  it('should throw if quantity is zero', () => {
    expect(() => new OrderItem('p1', 'A', 10, 0)).toThrow('Quantity must be at least 1');
  });

  it('should throw if quantity is negative', () => {
    expect(() => new OrderItem('p1', 'A', 10, -1)).toThrow('Quantity must be at least 1');
  });

  it('should throw if price is negative', () => {
    expect(() => new OrderItem('p1', 'A', -5, 1)).toThrow('Price cannot be negative');
  });

  it('should allow price of zero (free item)', () => {
    const item = new OrderItem('p1', 'A', 0, 1);
    expect(item.getTotal()).toBe(0);
  });
});
