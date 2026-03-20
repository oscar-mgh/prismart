import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';

export class ProductDiscountResponseDto {
  @ApiProperty({ example: 'SUMMER2026' })
  code: string;

  @ApiProperty({ example: false })
  isExpired: boolean;

  @ApiProperty({ example: 15 })
  percentage: number;

  @ApiProperty()
  expiresAt: Date;
}

export class ProductResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({ example: 'Wireless Mouse' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'High-precision wireless mouse with ergonomic design' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'MOUSE-001' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 24.99 })
  @IsNumber()
  @Min(0)
  finalPrice: number;

  @ApiProperty({ example: 42 })
  @IsNumber()
  @Min(0)
  purchaseCount: number;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/example/image.jpg', nullable: true })
  @IsOptional()
  @IsString()
  productImage?: string | null;

  @ApiPropertyOptional({ example: 4.5, nullable: true })
  @IsOptional()
  @IsNumber()
  averageRating: number | null;

  @ApiPropertyOptional({ type: ProductDiscountResponseDto })
  @IsOptional()
  @Type(() => Object)
  @ValidateNested()
  discount?: {
    code: string;
    isExpired: boolean;
    percentage: number;
    expiresAt: Date;
  };
}
