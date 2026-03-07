import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { Store } from '../../../domain/entities/store.entity';
import { Address } from '../../../domain/value-objects/address.vo';
import { StoreResponseDto } from '../../http/dtos/store-response.dto';
import { StorePersistenceDto } from '../dtos/store.persistence.dto';
import { StoreDocument } from '../entities/store.schema';

export class StoreMapper {
  static toDomain(raw: StoreDocument): Store {
    const address = new Address({
      street: raw.address.street,
      city: raw.address.city,
      state: raw.address.state,
      zipCode: raw.address.zipCode,
      country: raw.address.country,
    });

    return new Store(
      Id.fromString(raw._id.toString()),
      raw.name,
      raw.adminIds.map((id) => Id.fromString(id)),
      address,
      raw.active,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toPersistence(domain: Store): StorePersistenceDto {
    const addr = domain.getAddress();

    return {
      _id: domain.id.getValue(),
      name: domain.getName(),
      adminIds: domain.getAdminIds().map((id) => id.getValue()),
      address: {
        street: addr.getStreet(),
        city: addr.getCity(),
        state: addr.getState(),
        zipCode: addr.getZipCode(),
        country: addr.getCountry(),
      },
      active: domain.isActive(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
    };
  }

  static toResponse(domain: Store): StoreResponseDto {
    return {
      id: domain.id.getValue(),
      name: domain.getName(),
      adminIds: domain.getAdminIds().map((id) => id.getValue()),
      address: {
        street: domain.getAddress().getStreet(),
        city: domain.getAddress().getCity(),
        state: domain.getAddress().getState(),
        zipCode: domain.getAddress().getZipCode(),
        country: domain.getAddress().getCountry(),
      },
    };
  }
}
