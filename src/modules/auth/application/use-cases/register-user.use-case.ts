import { ConflictException, Injectable } from '@nestjs/common';
import { Email } from 'src/modules/auth/domain/value-objects/email.vo';
import { IdGenerator } from 'src/modules/shared/infrastructure/id-generator.service';
import { Id } from '../../../shared/domain/value-objects/id.vo';
import { User, UserRole } from '../../domain/entities/user.entity';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { RegisterUserCommand } from './commands/register-user.command';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly hasher: PasswordHasherPort,
  ) {}

  async execute(command: RegisterUserCommand): Promise<User> {
    const existing = await this.userRepository.findByEmail(command.email);
    if (existing) throw new ConflictException('User already exists');

    const hashedPassword = await this.hasher.hash(command.password);

    const newUser = new User(
      Id.fromString(IdGenerator.next().getValue()),
      command.username,
      new Email(command.email),
      hashedPassword,
      UserRole.CUSTOMER,
      true,
      undefined,
    );

    await this.userRepository.save(newUser);

    return newUser;
  }
}
