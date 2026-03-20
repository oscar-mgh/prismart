import { ConflictException } from '@nestjs/common';
import { Email } from '../../domain/value-objects/email.vo';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { User, UserRole } from '../../domain/entities/user.entity';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { RegisterUserUseCase } from './register-user.use-case';

const VALID_ID = Id.fromString('aabbccddee11223344556677');

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryPort>;
  let hasher: jest.Mocked<PasswordHasherPort>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<UserRepositoryPort>;

    hasher = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as jest.Mocked<PasswordHasherPort>;

    useCase = new RegisterUserUseCase(userRepository, hasher);
  });

  it('should register a new user with hashed password and CUSTOMER role', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    hasher.hash.mockResolvedValue('hashed_123');
    userRepository.save.mockImplementation(async (user) => user);

    const result = await useCase.execute({
      username: 'newuser',
      email: 'new@example.com',
      password: 'plain_password',
    });

    expect(result.getEmail().getValue()).toBe('new@example.com');
    expect(result.getRole()).toBe(UserRole.CUSTOMER);
    expect(result.isActive()).toBe(true);
    expect(hasher.hash).toHaveBeenCalledWith('plain_password');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw ConflictException if email already exists', async () => {
    const existingUser = new User(VALID_ID, 'existing', new Email('dup@example.com'), 'hashed', UserRole.CUSTOMER, true);
    userRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(
      useCase.execute({ username: 'newuser', email: 'dup@example.com', password: 'pw' }),
    ).rejects.toThrow(ConflictException);

    expect(hasher.hash).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
