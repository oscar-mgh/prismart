import { IsMongoId, IsNumber, IsObject, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(4)
  @MaxLength(40)
  sku: string;

  @IsMongoId()
  storeId: string;

  @MinLength(2)
  @MaxLength(50)
  name: string;

  @IsString()
  @MaxLength(500)
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  stock: number;

  @IsString()
  category: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  purchaseCount?: number;

  @IsObject()
  @IsOptional()
  discount?: {
    code: string;
    percentage: number;
    expirationDate: Date;
  };
}
