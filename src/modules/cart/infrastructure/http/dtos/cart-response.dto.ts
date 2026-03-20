import { ApiProperty } from '@nestjs/swagger';

export class CartItemResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  productId: string;

  @ApiProperty({ example: 2 })
  quantity: number;
}

export class CartResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  userId: string;

  @ApiProperty({ type: [CartItemResponseDto] })
  items: CartItemResponseDto[];

  @ApiProperty({ example: 3 })
  totalItems: number;

  @ApiProperty()
  updatedAt: Date;
}
