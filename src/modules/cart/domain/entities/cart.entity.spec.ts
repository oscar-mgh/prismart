import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { CartItem } from '../value-objects/cart-item.vo';
import { Cart } from './cart.entity';

const VALID_ID = Id.fromString('aabbccddee11223344556677');

function createCart(items: CartItem[] = []): Cart {
  return new Cart(VALID_ID, 'user-1', items);
}

describe('Cart Entity', () => {
  describe('updateProductQuantity', () => {
    it('should add a new product to an empty cart', () => {
      const cart = createCart();
      cart.updateProductQuantity('prod-1', 3);
      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItems()[0].getProductId()).toBe('prod-1');
      expect(cart.getItems()[0].getQuantity()).toBe(3);
    });

    it('should accumulate quantity for an existing product', () => {
      const cart = createCart([new CartItem('prod-1', 2)]);
      cart.updateProductQuantity('prod-1', 3);
      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItems()[0].getQuantity()).toBe(5);
    });

    it('should remove item when quantity is zero or negative', () => {
      const cart = createCart([new CartItem('prod-1', 2)]);
      cart.updateProductQuantity('prod-1', -1);
      expect(cart.getItems()).toHaveLength(0);
    });
  });

  describe('removeItem', () => {
    it('should remove an existing item by productId', () => {
      const cart = createCart([new CartItem('prod-1', 2), new CartItem('prod-2', 1)]);
      cart.removeItem('prod-1');
      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItems()[0].getProductId()).toBe('prod-2');
    });

    it('should do nothing if productId does not exist', () => {
      const cart = createCart([new CartItem('prod-1', 2)]);
      cart.removeItem('non-existent');
      expect(cart.getItems()).toHaveLength(1);
    });
  });

  describe('clear', () => {
    it('should remove all items', () => {
      const cart = createCart([new CartItem('prod-1', 2), new CartItem('prod-2', 1)]);
      cart.clear();
      expect(cart.getItems()).toHaveLength(0);
    });
  });

  describe('getTotalItems', () => {
    it('should return sum of all item quantities', () => {
      const cart = createCart([new CartItem('prod-1', 2), new CartItem('prod-2', 3)]);
      expect(cart.getTotalItems()).toBe(5);
    });

    it('should return 0 for empty cart', () => {
      expect(createCart().getTotalItems()).toBe(0);
    });
  });

  describe('getItems immutability', () => {
    it('should return a copy of items, not the internal reference', () => {
      const cart = createCart([new CartItem('prod-1', 2)]);
      const items = cart.getItems();
      items.pop();
      expect(cart.getItems()).toHaveLength(1);
    });
  });
});
