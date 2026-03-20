import { Email } from '../value-objects/email.vo';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { User, UserRole } from './user.entity';

const VALID_ID = Id.fromString('aabbccddee11223344556677');
const VALID_ID_2 = Id.fromString('112233445566778899aabbcc');

function createUser(overrides: Partial<{ username: string; role: UserRole; active: boolean; storeId: Id }> = {}): User {
  return new User(
    VALID_ID,
    overrides.username ?? 'testuser',
    new Email('test@example.com'),
    'hashed_password',
    overrides.role ?? UserRole.CUSTOMER,
    overrides.active ?? true,
    overrides.storeId,
  );
}

describe('User Entity', () => {
  describe('creation validations', () => {
    it('should create a valid user', () => {
      const user = createUser();
      expect(user.getUsername()).toBe('testuser');
      expect(user.getRole()).toBe(UserRole.CUSTOMER);
      expect(user.isActive()).toBe(true);
    });

    it('should throw if username is too short (< 4)', () => {
      expect(() => createUser({ username: 'abc' })).toThrow('Invalid username');
    });

    it('should throw if username is too long (> 40)', () => {
      expect(() => createUser({ username: 'a'.repeat(41) })).toThrow('Invalid username');
    });

    it('should accept username at boundary lengths (4 and 40)', () => {
      expect(() => createUser({ username: 'abcd' })).not.toThrow();
      expect(() => createUser({ username: 'a'.repeat(40) })).not.toThrow();
    });
  });

  describe('activate / deactivate', () => {
    it('should deactivate an active user', () => {
      const user = createUser();
      user.deactivate();
      expect(user.isActive()).toBe(false);
    });

    it('should activate an inactive user', () => {
      const user = createUser({ active: false });
      user.activate();
      expect(user.isActive()).toBe(true);
    });
  });

  describe('assignStore', () => {
    it('should assign a store to a CUSTOMER and promote to SALES_ADMIN', () => {
      const user = createUser({ role: UserRole.CUSTOMER });
      user.assignStore(VALID_ID_2);
      expect(user.getStoreId()?.getValue()).toBe(VALID_ID_2.getValue());
      expect(user.getRole()).toBe(UserRole.SALES_ADMIN);
    });

    it('should silently ignore assignStore for SUPER_ADMIN', () => {
      const user = createUser({ role: UserRole.SUPER_ADMIN });
      user.assignStore(VALID_ID_2);
      expect(user.getStoreId()).toBeUndefined();
    });

    it('should silently ignore assignStore for SUPPORT', () => {
      const user = createUser({ role: UserRole.SUPPORT });
      user.assignStore(VALID_ID_2);
      expect(user.getStoreId()).toBeUndefined();
    });

    it('should throw if user already has a store assigned', () => {
      const user = createUser({ role: UserRole.CUSTOMER, storeId: VALID_ID_2 });
      expect(() => user.assignStore(VALID_ID)).toThrow('User already has a store assigned');
    });
  });

  describe('promoteToSalesAdmin', () => {
    it('should promote a CUSTOMER to SALES_ADMIN', () => {
      const user = createUser({ role: UserRole.CUSTOMER });
      user.promoteToSalesAdmin();
      expect(user.getRole()).toBe(UserRole.SALES_ADMIN);
    });

    it('should not change role for SUPER_ADMIN', () => {
      const user = createUser({ role: UserRole.SUPER_ADMIN });
      user.promoteToSalesAdmin();
      expect(user.getRole()).toBe(UserRole.SUPER_ADMIN);
    });
  });
});
