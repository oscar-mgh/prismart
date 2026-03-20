import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { Sku } from 'src/modules/catalog/domain/value-objects/sku.vo';
import { ProductDiscount } from '../value-objects/product-discount.vo';
import { Product } from './product.entity';

const VALID_ID = Id.fromString('aabbccddee11223344556677');
const STORE_ID = Id.fromString('112233445566778899aabbcc');

function createProduct(overrides: Partial<{ name: string; price: number; stock: number; discount: ProductDiscount }> = {}): Product {
  return new Product(
    VALID_ID,
    STORE_ID,
    new Sku('SKU-1234'),
    overrides.name ?? 'Test Product',
    'Product description',
    overrides.price ?? 100,
    overrides.stock ?? 50,
    'Electronics',
    true,
    0,
    overrides.discount,
  );
}

describe('Product Entity', () => {
  describe('creation validations', () => {
    it('should create a valid product', () => {
      const product = createProduct();
      expect(product.getName()).toBe('Test Product');
      expect(product.getPrice()).toBe(100);
      expect(product.getStock()).toBe(50);
    });

    it('should throw if name is too short (< 2)', () => {
      expect(() => createProduct({ name: 'A' })).toThrow('Invalid name length');
    });

    it('should throw if name is too long (> 50)', () => {
      expect(() => createProduct({ name: 'A'.repeat(51) })).toThrow('Invalid name length');
    });

    it('should throw if price is zero', () => {
      expect(() => createProduct({ price: 0 })).toThrow('Price must be positive');
    });

    it('should throw if price is negative', () => {
      expect(() => createProduct({ price: -10 })).toThrow('Price must be positive');
    });

    it('should throw if stock is negative', () => {
      expect(() => createProduct({ stock: -1 })).toThrow('Stock cannot be negative');
    });

    it('should allow stock of zero', () => {
      expect(() => createProduct({ stock: 0 })).not.toThrow();
    });
  });

  describe('getFinalPrice', () => {
    it('should return base price when no discount', () => {
      const product = createProduct({ price: 200 });
      expect(product.getFinalPrice()).toBe(200);
    });

    it('should return discounted price when discount is active', () => {
      const futureDate = new Date(Date.now() + 86400000);
      const discount = new ProductDiscount('PROMO10', 10, futureDate);
      const product = createProduct({ price: 200, discount });
      expect(product.getFinalPrice()).toBe(180);
    });

    it('should return base price when discount is expired', () => {
      const pastDate = new Date(Date.now() - 86400000);
      const discount = new ProductDiscount('EXPIRED', 25, pastDate);
      const product = createProduct({ price: 200, discount });
      expect(product.getFinalPrice()).toBe(200);
    });
  });

  describe('updateStock', () => {
    it('should update stock to a valid value', () => {
      const product = createProduct({ stock: 10 });
      product.updateStock(25);
      expect(product.getStock()).toBe(25);
    });

    it('should throw if new stock is negative', () => {
      const product = createProduct({ stock: 10 });
      expect(() => product.updateStock(-1)).toThrow('Wrong stock quantity');
    });

    it('should allow setting stock to zero', () => {
      const product = createProduct({ stock: 10 });
      product.updateStock(0);
      expect(product.getStock()).toBe(0);
    });
  });

  describe('applyDiscount / removeDiscount', () => {
    it('should apply and then remove a discount', () => {
      const product = createProduct({ price: 100 });
      const futureDate = new Date(Date.now() + 86400000);
      const discount = new ProductDiscount('CODE', 50, futureDate);

      product.applyDiscount(discount);
      expect(product.getFinalPrice()).toBe(50);

      product.removeDiscount();
      expect(product.getFinalPrice()).toBe(100);
    });
  });
});
