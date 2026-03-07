import { Types } from 'mongoose';
import { Id } from '../domain/value-objects/id.vo';

export class IdGenerator {
  public static next(): Id {
    return Id.fromString(new Types.ObjectId().toHexString());
  }
}