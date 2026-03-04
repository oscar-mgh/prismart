import { IsNumber, IsOptional, IsString, MaxLength, Min, MinLength, Max } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  productId: string;

  @IsString()
  @MinLength(4)
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(30)
  @MaxLength(1000)
  description: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  reviewImage?: string;
}
