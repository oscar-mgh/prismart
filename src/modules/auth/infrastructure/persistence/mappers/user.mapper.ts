import { Types } from 'mongoose';
import { User } from 'src/modules/auth/domain/entities/user.entity';
import { Email } from 'src/modules/auth/domain/value-objects/email.vo';
import { Id } from '../../../../shared/domain/value-objects/id.vo';
import { UserDocument } from '../entities/user.schema';

export class UserMapper {
  static toDomain(raw: UserDocument): User {
    return new User(
      Id.fromString(raw._id.toString()),
      raw.username,
      new Email(raw.email),
      raw.password,
      raw.role,
      raw.active,
      raw.storeId ? Id.fromString(raw.storeId.toString()) : undefined,
    );
  }

  static toPersistence(domain: User): Partial<UserDocument> {
    return {
      _id: new Types.ObjectId(domain.id.getValue()),
      username: domain.getUsername(),
      email: domain.getEmail().getValue(),
      password: domain.getPassword(),
      role: domain.getRole(),
      active: domain.isActive(),
      storeId: domain.storeId?.getValue() ? new Types.ObjectId(domain.storeId.toString()) : undefined,
    };
  }
}
