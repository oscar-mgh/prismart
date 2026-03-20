import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'src/modules/auth/domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  role: UserRole;

  @ApiProperty({ example: true })
  active: boolean;

  static fromDomain(user: any): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id.getValue();
    dto.username = user.getUsername();
    dto.email = user.getEmail().getValue();
    dto.role = user.getRole();
    dto.active = user.isActive();
    return dto;
  }
}
