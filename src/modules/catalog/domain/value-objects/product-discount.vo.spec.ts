import { ProductDiscount } from './product-discount.vo';

describe('ProductDiscount Value Object', () => {
  const futureDate = new Date(Date.now() + 86400000);
  const pastDate = new Date(Date.now() - 86400000);

  describe('creation validations', () => {
    it('should create a valid discount', () => {
      const discount = new ProductDiscount('PROMO10', 10, futureDate);
      expect(discount.getCode()).toBe('PROMO10');
      expect(discount.getPercentage()).toBe(10);
    });

    it('should throw if percentage is zero', () => {
      expect(() => new ProductDiscount('CODE', 0, futureDate)).toThrow();
    });

    it('should throw if percentage is negative', () => {
      expect(() => new ProductDiscount('CODE', -5, futureDate)).toThrow();
    });

    it('should throw if percentage exceeds 100', () => {
      expect(() => new ProductDiscount('CODE', 101, futureDate)).toThrow();
    });

    it('should accept boundary values (1 and 100)', () => {
      expect(() => new ProductDiscount('C', 1, futureDate)).not.toThrow();
      expect(() => new ProductDiscount('C', 100, futureDate)).not.toThrow();
    });
  });

  describe('isExpired', () => {
    it('should return false for future expiration', () => {
      const discount = new ProductDiscount('CODE', 10, futureDate);
      expect(discount.isExpired()).toBe(false);
    });

    it('should return true for past expiration', () => {
      const discount = new ProductDiscount('CODE', 10, pastDate);
      expect(discount.isExpired()).toBe(true);
    });
  });

  describe('getDiscountAmount', () => {
    it('should calculate correct discount amount when active', () => {
      const discount = new ProductDiscount('CODE', 25, futureDate);
      expect(discount.getDiscountAmount(200)).toBe(50);
    });

    it('should return 0 when discount is expired', () => {
      const discount = new ProductDiscount('CODE', 25, pastDate);
      expect(discount.getDiscountAmount(200)).toBe(0);
    });

    it('should handle 100% discount', () => {
      const discount = new ProductDiscount('FREE', 100, futureDate);
      expect(discount.getDiscountAmount(150)).toBe(150);
    });
  });
});
