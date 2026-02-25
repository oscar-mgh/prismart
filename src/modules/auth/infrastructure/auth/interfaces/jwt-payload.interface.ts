import { UserRole } from '../../../domain/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  storeId?: string;
  iat?: number;
  exp?: number;
}
