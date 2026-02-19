import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { DisableUserUseCase } from '../application/use-cases/disable-user.use-case';
import { EnableUserUseCase } from '../application/use-cases/enable-user.use-case';
import { LoginUseCase } from '../application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '../application/use-cases/register-user.use-case';
import { PasswordHasherPort } from '../domain/ports/password-hasher.port';
import { UserRepositoryPort } from '../domain/ports/user-repository.port';
import { TokenService } from './auth/services/token.service';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { AuthController } from './controllers/auth.controller';
import { UserDocument, UserSchema } from './persistence/entities/user.schema';
import { MongooseUserRepository } from './persistence/repositories/mongoose-user.repository';
import { BcryptHasher } from './security/bcrypt-hasher';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
        signOptions: { expiresIn: configService.get<number>('JWT_EXPIRES_IN') || '24h' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: UserDocument.name, schema: UserSchema }]),
  ],
  providers: [
    RegisterUserUseCase,
    LoginUseCase,
    DisableUserUseCase,
    EnableUserUseCase,
    {
      provide: UserRepositoryPort,
      useClass: MongooseUserRepository,
    },
    {
      provide: PasswordHasherPort,
      useClass: BcryptHasher,
    },
    TokenService,
    JwtStrategy,
  ],
  controllers: [AuthController],
  exports: [UserRepositoryPort, PassportModule, JwtModule],
})
export class AuthModule {}
