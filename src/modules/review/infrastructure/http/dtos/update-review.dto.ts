import { IsNumber, IsOptional, IsString, MaxLength, Min, MinLength, Max } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(30)
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  reviewImage?: string;
}
