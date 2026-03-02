import { Injectable } from '@nestjs/common';
import { CreateOrderUseCase } from 'src/modules/order/application/use-cases/create-order.use-case';
import { CheckoutPort, CheckoutResult } from '../../domain/ports/checkout.port';

@Injectable()
export class CheckoutAdapter implements CheckoutPort {
  constructor(private readonly createOrderUseCase: CreateOrderUseCase) {}

  async createOrderFromCart(
    customerId: string,
    items: { productId: string; quantity: number }[],
  ): Promise<CheckoutResult> {
    const order = await this.createOrderUseCase.execute({ customerId, items });

    return {
      orderId: order.id.getValue(),
      totalAmount: order.getTotalAmount(),
      status: order.getStatus(),
      createdAt: order.getCreatedAt(),
      items: order.getItems().map((item) => ({
        productId: item.getProductId(),
        name: item.getProductName(),
        price: item.getUnitPrice(),
        quantity: item.getQuantity(),
      })),
    };
  }
}
