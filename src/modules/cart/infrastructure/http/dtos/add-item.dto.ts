import { IsMongoId, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddItemDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  productId: string;

  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}
