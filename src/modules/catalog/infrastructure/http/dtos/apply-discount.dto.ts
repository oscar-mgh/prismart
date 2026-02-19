import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class ApplyDiscountDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skus?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(13)
  code: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsNotEmpty()
  percentage: number;

  @IsDateString()
  @IsNotEmpty()
  expirationDate: string;
}
