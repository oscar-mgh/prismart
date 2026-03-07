import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
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
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto): Promise<UserResponseDto & { token: string }> {
    const user = await this.registerUserUseCase.execute(dto);
    const token = this.tokenService.generateToken(user);
    return { ...UserResponseDto.fromDomain(user), token: token.access_token };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<UserResponseDto & { token: string }> {
    const user = await this.loginUseCase.execute(dto);
    const token = this.tokenService.generateToken(user);
    return { ...UserResponseDto.fromDomain(user), token: token.access_token };
  }

  @Post('promote')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async promoteToSalesAdmin(@Body() dto: PromoteToSalesAdminDto): Promise<{ token: string }> {
    const { email, username } = dto;
    const result = await this.promoteUserToSalesAdminUseCase.execute({ email, username });
    return { token: result.token };
  }

  @Delete('disable/:userId')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async disableUser(@Param('userId', ValidateObjectIdPipe) userId: string): Promise<void> {
    await this.disableUserUseCase.execute(userId);
  }

  @Patch('enable/:userId')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async enableUser(@Param('userId', ValidateObjectIdPipe) userId: string): Promise<void> {
    await this.enableUserUseCase.execute(userId);
  }
}
