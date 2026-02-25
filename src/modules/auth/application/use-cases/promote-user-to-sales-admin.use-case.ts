import { Injectable } from '@nestjs/common';

import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
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
        const storeId = Id.create();
        existingUser.assignStore(storeId);
      } else if (existingUser.getRole() !== UserRole.SALES_ADMIN) {
        existingUser.promoteToSalesAdmin();
      }

      await this.userRepository.save(existingUser);

      const token = this.tokenService.generateToken(existingUser);
      return { token: token.access_token };
    }

    const storeId = Id.create();

    const tempUser = new User(
      Id.create(),
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
