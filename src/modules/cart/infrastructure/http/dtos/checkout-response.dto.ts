export class CheckoutItemResponseDto {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export class CheckoutResponseDto {
  orderId: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  items: CheckoutItemResponseDto[];
}
