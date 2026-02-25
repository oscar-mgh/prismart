import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../../../domain/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(user: User) {
    const basePayload: Pick<JwtPayload, 'sub' | 'email' | 'role'> = {
      sub: user.id.getValue(),
      email: user.getEmail().getValue(),
      role: user.getRole(),
    };

    const payload: JwtPayload =
      user.getRole() === UserRole.SALES_ADMIN && user.storeId
        ? { ...basePayload, storeId: user.storeId.getValue() }
        : basePayload;

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
