import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Email } from 'src/modules/auth/domain/value-objects/email.vo';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { IdGenerator } from 'src/modules/shared/infrastructure/id-generator.service';
import { User, UserRole } from '../../domain/entities/user.entity';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';

@Injectable()
export class EnsureSuperAdminUseCase {
  private readonly logger = new Logger(EnsureSuperAdminUseCase.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly hasher: PasswordHasherPort,
    private readonly configService: ConfigService,
  ) {}

  async execute(): Promise<void> {
    const email = this.configService.get<string>('SUPER_ADMIN_EMAIL')?.trim();
    const password = this.configService.get<string>('SUPER_ADMIN_PASSWORD')?.trim();

    if (!email || !password) {
      this.logger.warn('SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set. Skipping super admin bootstrap.');
      return;
    }

    const existing = await this.userRepository.findByEmail(email);

    if (existing) {
      // User already exists, nothing to do as requested.
      this.logger.log(`Super admin user with email ${email} already exists. Skipping creation.`);
      return;
    }

    const hashedPassword = await this.hasher.hash(password);

    const username = this.configService.get<string>('SUPER_ADMIN_USERNAME')?.trim() || 'superadmin';

    const superAdmin = new User(
      Id.fromString(IdGenerator.next().getValue()),
      username,
      new Email(email),
      hashedPassword,
      UserRole.SUPER_ADMIN,
      true,
      undefined,
    );

    await this.userRepository.save(superAdmin);

    this.logger.log(`Super admin user with email ${email} has been created.`);
  }
}
