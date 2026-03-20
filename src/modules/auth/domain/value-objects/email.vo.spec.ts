import { Email } from './email.vo';

describe('Email Value Object', () => {
  it('should create a valid email', () => {
    const email = new Email('user@example.com');
    expect(email.getValue()).toBe('user@example.com');
  });

  it('should normalize to lowercase', () => {
    const email = new Email('User@Example.COM');
    expect(email.getValue()).toBe('user@example.com');
  });

  it('should throw on missing @ symbol', () => {
    expect(() => new Email('userexample.com')).toThrow('Invalid email format');
  });

  it('should throw on missing domain', () => {
    expect(() => new Email('user@')).toThrow('Invalid email format');
  });

  it('should throw on empty string', () => {
    expect(() => new Email('')).toThrow('Invalid email format');
  });

  it('should throw on email with spaces', () => {
    expect(() => new Email('user @example.com')).toThrow('Invalid email format');
  });
});
