import { ApiProperty } from '@nestjs/swagger';

export class CheckoutItemResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  productId: string;

  @ApiProperty({ example: 'Wireless Mouse' })
  name: string;

  @ApiProperty({ example: 29.99 })
  price: number;

  @ApiProperty({ example: 2 })
  quantity: number;
}

export class CheckoutResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439013' })
  orderId: string;

  @ApiProperty({ example: 59.98 })
  totalAmount: number;

  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [CheckoutItemResponseDto] })
  items: CheckoutItemResponseDto[];
}
