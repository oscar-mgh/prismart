import { UnauthorizedException } from '@nestjs/common';
import { Email } from '../../domain/value-objects/email.vo';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { User, UserRole } from '../../domain/entities/user.entity';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { LoginUseCase } from './login-user.use-case';

const VALID_ID = Id.fromString('aabbccddee11223344556677');

function createActiveUser(): User {
  return new User(VALID_ID, 'testuser', new Email('test@example.com'), 'hashed_pw', UserRole.CUSTOMER, true);
}

function createDisabledUser(): User {
  return new User(VALID_ID, 'testuser', new Email('test@example.com'), 'hashed_pw', UserRole.CUSTOMER, false);
}

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
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

    useCase = new LoginUseCase(userRepository, hasher);
  });

  it('should return the user on successful login', async () => {
    const user = createActiveUser();
    userRepository.findByEmail.mockResolvedValue(user);
    hasher.compare.mockResolvedValue(true);

    const result = await useCase.execute({ email: 'test@example.com', password: 'correct_pw' });

    expect(result).toBe(user);
    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(hasher.compare).toHaveBeenCalledWith('correct_pw', 'hashed_pw');
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute({ email: 'ghost@example.com', password: 'pw' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password is invalid', async () => {
    userRepository.findByEmail.mockResolvedValue(createActiveUser());
    hasher.compare.mockResolvedValue(false);

    await expect(useCase.execute({ email: 'test@example.com', password: 'wrong_pw' }))
      .rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if user account is disabled', async () => {
    userRepository.findByEmail.mockResolvedValue(createDisabledUser());
    hasher.compare.mockResolvedValue(true);

    await expect(useCase.execute({ email: 'test@example.com', password: 'correct_pw' }))
      .rejects.toThrow(UnauthorizedException);
  });
});
