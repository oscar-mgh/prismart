import { Injectable } from '@nestjs/common';

import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { IdGenerator } from 'src/modules/shared/infrastructure/id-generator.service';
import { User, UserRole } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { Email } from '../../domain/value-objects/email.vo';
import { TokenService } from '../../infrastructure/auth/services/token.service';
import { PromoteUserToSalesAdminCommand } from './commands/promote-user-to-sales-admin.command';

@Injectable()
export class PromoteUserToSalesAdminUseCase {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly tokenService: TokenService,
  ) {}

  async execute(command: PromoteUserToSalesAdminCommand): Promise<{ token: string }> {
    const existingUser = await this.userRepository.findByEmail(command.email);

    if (existingUser) {
      if (!existingUser.getStoreId()) {
        const storeId = Id.fromString(IdGenerator.next().getValue());
        existingUser.assignStore(storeId);
      } else if (existingUser.getRole() !== UserRole.SALES_ADMIN) {
        existingUser.promoteToSalesAdmin();
      }

      await this.userRepository.save(existingUser);

      const token = this.tokenService.generateToken(existingUser);
      return { token: token.access_token };
    }

    const storeId = Id.fromString(IdGenerator.next().getValue());

    const tempUser = new User(
      Id.fromString(IdGenerator.next().getValue()),
      command.username,
      new Email(command.email),
      'temporary-password',
      UserRole.SALES_ADMIN,
      true,
      storeId,
    );

    const token = this.tokenService.generateToken(tempUser);
    return { token: token.access_token };
  }
}
