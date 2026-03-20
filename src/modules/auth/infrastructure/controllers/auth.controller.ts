import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidateObjectIdPipe } from 'src/modules/shared/infrastructure/pipes/validate-object-id.pipe';
import { DisableUserUseCase } from '../../application/use-cases/disable-user.use-case';
import { EnableUserUseCase } from '../../application/use-cases/enable-user.use-case';
import { LoginUseCase } from '../../application/use-cases/login-user.use-case';
import { PromoteUserToSalesAdminUseCase } from '../../application/use-cases/promote-user-to-sales-admin.use-case';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { UserRole } from '../../domain/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TokenService } from '../auth/services/token.service';
import { LoginDto } from '../http/dtos/login.dto';
import { PromoteToSalesAdminDto } from '../http/dtos/promote-to-sales-admin.dto';
import { RegisterUserDto } from '../http/dtos/register-user.dto';
import { UserResponseDto } from '../http/dtos/user-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly promoteUserToSalesAdminUseCase: PromoteUserToSalesAdminUseCase,
    private readonly tokenService: TokenService,
    private readonly disableUserUseCase: DisableUserUseCase,
    private readonly enableUserUseCase: EnableUserUseCase,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto & { token: string }> {
    const user = await this.registerUserUseCase.execute(dto);
    const token = this.tokenService.generateToken(user);
    return { ...UserResponseDto.fromDomain(user), token: token.access_token };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<UserResponseDto & { token: string }> {
    const user = await this.loginUseCase.execute(dto);
    const token = this.tokenService.generateToken(user);
    return { ...UserResponseDto.fromDomain(user), token: token.access_token };
  }

  @Post('promote')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Promote a user to Sales Admin (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'User promoted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires SUPER_ADMIN role' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async promoteToSalesAdmin(@Body() dto: PromoteToSalesAdminDto): Promise<{ token: string }> {
    const { email, username } = dto;
    const result = await this.promoteUserToSalesAdminUseCase.execute({ email, username });
    return { token: result.token };
  }

  @Delete('disable/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable a user account (SUPER_ADMIN only)' })
  @ApiParam({ name: 'userId', description: 'User ID to disable' })
  @ApiResponse({ status: 204, description: 'User disabled successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires SUPER_ADMIN role' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async disableUser(@Param('userId', ValidateObjectIdPipe) userId: string): Promise<void> {
    await this.disableUserUseCase.execute(userId);
  }

  @Patch('enable/:userId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable a user account (SUPER_ADMIN only)' })
  @ApiParam({ name: 'userId', description: 'User ID to enable' })
  @ApiResponse({ status: 200, description: 'User enabled successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden — requires SUPER_ADMIN role' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async enableUser(@Param('userId', ValidateObjectIdPipe) userId: string): Promise<void> {
    await this.enableUserUseCase.execute(userId);
  }
}
