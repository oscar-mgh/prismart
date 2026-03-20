import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { Email } from 'src/modules/auth/domain/value-objects/email.vo';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { IdGenerator } from 'src/modules/shared/infrastructure/id-generator.service';
import { User, UserRole } from '../../domain/entities/user.entity';
import { PasswordHasherPort } from '../../domain/ports/password-hasher.port';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import {
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_USERNAME,
} from '../../infrastructure/auth.tokens';

@Injectable()
export class EnsureSuperAdminUseCase {
  private readonly logger = new Logger(EnsureSuperAdminUseCase.name);

  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly hasher: PasswordHasherPort,
    @Inject(SUPER_ADMIN_EMAIL) private readonly superAdminEmail: string | undefined,
    @Inject(SUPER_ADMIN_PASSWORD) private readonly superAdminPassword: string | undefined,
    @Optional() @Inject(SUPER_ADMIN_USERNAME) private readonly superAdminUsername: string | undefined,
  ) {}

  async execute(): Promise<void> {
    const email = this.superAdminEmail?.trim();
    const password = this.superAdminPassword?.trim();

    if (!email || !password) {
      this.logger.warn('SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set. Skipping super admin bootstrap.');
      return;
    }

    const existing = await this.userRepository.findByEmail(email);

    if (existing) {
      this.logger.log(`Super admin user with email ${email} already exists. Skipping creation.`);
      return;
    }

    const hashedPassword = await this.hasher.hash(password);

    const username = this.superAdminUsername?.trim() || 'superadmin';

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
