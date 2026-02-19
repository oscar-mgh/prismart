import { Injectable } from '@nestjs/common';
import { EntityFinderService } from 'src/modules/shared/application/services/entity-finder.service';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';

@Injectable()
export class EnableUserUseCase {
  constructor(
    private readonly entityFinder: EntityFinderService,
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.entityFinder.findOrThrow(this.userRepository, userId, 'User');
    user.activate();
    await this.userRepository.save(user);
  }
}
