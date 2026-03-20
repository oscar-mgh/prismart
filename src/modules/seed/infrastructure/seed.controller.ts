import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/modules/auth/domain/entities/user.entity';
import { GetUser } from 'src/modules/auth/infrastructure/auth/decorators/get-user.decorator';
import { Roles } from 'src/modules/auth/infrastructure/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/infrastructure/auth/guards/roles.guard';
import { SeedService } from '../application/seed.service';
import { SeedResponseDto } from './seed-response.dto';

@ApiTags('Seed')
@ApiBearerAuth()
@Controller('seed')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post()
  @ApiOperation({ summary: 'Seed the database with sample data (SUPER_ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Database seeded successfully', type: SeedResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden — requires SUPER_ADMIN role' })
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async seed(@GetUser('id') userId: string): Promise<SeedResponseDto> {
    return this.seedService.execute(userId);
  }
}
