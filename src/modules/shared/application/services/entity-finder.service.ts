import { Injectable } from '@nestjs/common';
import { EntityInactiveException, EntityNotFoundException } from '../../domain/exceptions/domain.exceptions';
import { EntityWithStatus, GenericRepositoryPort, UserSearchableRepository } from '../../domain/ports/repository.port';

@Injectable()
export class EntityFinderService {
  async findOrThrow<T extends EntityWithStatus>(
    repository: GenericRepositoryPort<T>,
    id: string,
    entityName: string,
    options?: any,
  ): Promise<T> {
    const entity = await repository.findById(id, options);

    if (!entity) {
      throw new EntityNotFoundException(entityName, id);
    }

    if (!entity.isActive()) {
      throw new EntityInactiveException(entityName, id);
    }

    return entity;
  }

  async findByUserOrThrow<T extends EntityWithStatus>(
    repository: UserSearchableRepository<T>,
    ownerId: string,
    entityName: string,
  ): Promise<T> {
    const entity = await repository.findByUserId(ownerId);

    if (!entity) {
      throw new EntityNotFoundException(entityName, ownerId);
    }

    if (!entity.isActive()) {
      throw new EntityInactiveException(entityName, ownerId);
    }

    return entity;
  }
}
