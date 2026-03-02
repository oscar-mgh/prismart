export interface CheckoutResultItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutResult {
  orderId: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
  items: CheckoutResultItem[];
}

export abstract class CheckoutPort {
  abstract createOrderFromCart(
    customerId: string,
    items: { productId: string; quantity: number }[],
  ): Promise<CheckoutResult>;
}
