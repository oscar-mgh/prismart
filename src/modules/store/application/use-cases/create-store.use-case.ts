import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from 'src/modules/auth/domain/entities/user.entity';
import { UserRepositoryPort } from 'src/modules/auth/domain/ports/user-repository.port';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { Store } from '../../domain/entities/store.entity';
import { StoreRepositoryPort } from '../../domain/ports/store-repository.port';
import { Address } from '../../domain/value-objects/address.vo';
import { CreateStoreCommand } from './commands/create-store.command';
import { IdGenerator } from 'src/modules/shared/infrastructure/id-generator.service';

@Injectable()
export class CreateStoreUseCase {
  constructor(
    private readonly storeRepository: StoreRepositoryPort,
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: CreateStoreCommand, userId: string): Promise<Store> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingStoreId = user.getStoreId();

    if (existingStoreId) {
      const existingStore = await this.storeRepository.findById(existingStoreId.toString());
      if (existingStore) {
        throw new ConflictException('User already owns a store');
      }
    }

    const nameExists = await this.storeRepository.existsByName(command.name);
    if (nameExists) {
      throw new ConflictException(`Store with name "${command.name}" already exists`);
    }

    const address = new Address({
      street: command.address.street,
      city: command.address.city,
      state: command.address.state,
      zipCode: command.address.zipCode,
      country: command.address.country,
    });

    const storeId = existingStoreId ?? Id.fromString(IdGenerator.next().getValue());
    const store = new Store(storeId, command.name, [Id.fromString(userId)], address, true, new Date(), new Date());

    if (!existingStoreId) {
      user.assignStore(storeId);
    } else if (user.getRole() !== UserRole.SALES_ADMIN) {
      user.promoteToSalesAdmin();
    }

    await this.storeRepository.save(store);
    await this.userRepository.save(user);

    return store;
  }
}
