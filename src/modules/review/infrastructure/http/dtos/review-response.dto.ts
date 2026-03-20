import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReviewResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439013' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'Great product!' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'This product exceeded my expectations in every way possible.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/example/review.jpg' })
  @IsOptional()
  @IsString()
  reviewImage?: string;
}
