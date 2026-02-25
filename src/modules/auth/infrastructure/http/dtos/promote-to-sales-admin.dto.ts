import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class PromoteToSalesAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(40)
  username: string;
}

