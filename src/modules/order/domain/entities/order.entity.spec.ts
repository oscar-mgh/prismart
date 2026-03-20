import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { OrderItem } from '../value-objects/order-item.vo';
import { OrderStatus } from '../enums/order-status.enum';
import { Order } from './order.entity';

const VALID_ID = Id.fromString('aabbccddee11223344556677');

function createOrder(overrides: Partial<{ status: OrderStatus; items: OrderItem[] }> = {}): Order {
  const items = overrides.items ?? [new OrderItem('prod-1', 'Product A', 100, 2)];
  return new Order(VALID_ID, 'customer-1', items, overrides.status ?? OrderStatus.PENDING);
}

describe('Order Entity', () => {
  describe('creation validations', () => {
    it('should create a valid order with PENDING status', () => {
      const order = createOrder();
      expect(order.getStatus()).toBe(OrderStatus.PENDING);
      expect(order.isActive()).toBe(true);
    });

    it('should throw if items array is empty', () => {
      expect(() => createOrder({ items: [] })).toThrow('Order must contain at least one item');
    });
  });

  describe('getTotalAmount', () => {
    it('should calculate total for a single item', () => {
      const order = createOrder({ items: [new OrderItem('p1', 'A', 50, 3)] });
      expect(order.getTotalAmount()).toBe(150);
    });

    it('should calculate total for multiple items', () => {
      const order = createOrder({
        items: [
          new OrderItem('p1', 'A', 50, 2),
          new OrderItem('p2', 'B', 30, 1),
        ],
      });
      expect(order.getTotalAmount()).toBe(130);
    });
  });

  describe('markAsPaid', () => {
    it('should mark a PENDING order as PAID', () => {
      const order = createOrder();
      order.markAsPaid();
      expect(order.getStatus()).toBe(OrderStatus.PAID);
    });

    it('should throw if order is not PENDING', () => {
      const order = createOrder({ status: OrderStatus.CANCELLED });
      expect(() => order.markAsPaid()).toThrow('Only pending orders can be marked as paid');
    });
  });

  describe('cancel', () => {
    it('should cancel a PENDING order and set active to false', () => {
      const order = createOrder();
      order.cancel();
      expect(order.getStatus()).toBe(OrderStatus.CANCELLED);
      expect(order.isActive()).toBe(false);
    });

    it('should throw if trying to cancel a non-PENDING order', () => {
      const order = createOrder({ status: OrderStatus.PAID });
      expect(() => order.cancel()).toThrow('Only pending orders can be cancelled');
    });
  });
});
