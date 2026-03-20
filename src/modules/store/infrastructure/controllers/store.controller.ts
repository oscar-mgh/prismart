import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/modules/auth/domain/entities/user.entity';
import { GetUser } from 'src/modules/auth/infrastructure/auth/decorators/get-user.decorator';
import { Roles } from 'src/modules/auth/infrastructure/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/auth/guards/jwt-auth.guard';
import { ValidateObjectIdPipe } from 'src/modules/shared/infrastructure/pipes/validate-object-id.pipe';
import { CreateStoreUseCase } from '../../application/use-cases/create-store.use-case';
import { DeleteStoreUseCase } from '../../application/use-cases/delete-store.use-case';
import { FindStoreByIdUseCase } from '../../application/use-cases/find-store-by-id.use-case';
import { StoreResponseDto } from '../http/dtos/store-response.dto';
import { StoreMapper } from '../persistence/mappers/store.mapper';
import { CreateStoreDto } from './create-store.dto';

@ApiTags('Stores')
@ApiBearerAuth()
@Controller('stores')
@UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(
    private readonly createUseCase: CreateStoreUseCase,
    private readonly findByIdUseCase: FindStoreByIdUseCase,
    private readonly deleteUseCase: DeleteStoreUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new store' })
  @ApiResponse({ status: 201, description: 'Store created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateStoreDto, @GetUser('id') userId: string): Promise<StoreResponseDto> {
    const store = await this.createUseCase.execute(dto, userId);
    return StoreMapper.toResponse(store);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a store by ID' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiResponse({ status: 200, description: 'Store found' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ValidateObjectIdPipe) id: string): Promise<StoreResponseDto> {
    const store = await this.findByIdUseCase.execute(id);
    return StoreMapper.toResponse(store);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a store (SUPER_ADMIN only)' })
  @ApiParam({ name: 'id', description: 'Store ID' })
  @ApiResponse({ status: 204, description: 'Store deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires SUPER_ADMIN role' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ValidateObjectIdPipe) id: string): Promise<void> {
    return this.deleteUseCase.execute(id);
  }
}
