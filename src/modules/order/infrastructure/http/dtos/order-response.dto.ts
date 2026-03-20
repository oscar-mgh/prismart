import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  productId: string;

  @ApiProperty({ example: 'Wireless Mouse' })
  name: string;

  @ApiProperty({ example: 29.99 })
  price: number;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 59.98 })
  subtotal: number;
}

export class OrderResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439013' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  customerId: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ example: 59.98 })
  totalAmount: number;

  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiProperty()
  createdAt: Date;
}
