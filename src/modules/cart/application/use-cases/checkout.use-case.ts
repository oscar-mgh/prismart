import { Injectable } from '@nestjs/common';
import { CheckoutPort, CheckoutResult } from '../../domain/ports/checkout.port';
import { CartRepositoryPort } from '../../domain/ports/cart-repository.port';
import { CheckoutCommand } from './commands/checkout.command';

@Injectable()
export class CheckoutUseCase {
  constructor(
    private readonly cartRepository: CartRepositoryPort,
    private readonly checkoutPort: CheckoutPort,
  ) {}

  async execute(command: CheckoutCommand, storeId: string): Promise<CheckoutResult> {
    const cart = await this.cartRepository.findByUserId(command.userId);
    if (!cart || cart.getItems().length === 0) {
      throw new Error('Cannot checkout an empty cart');
    }

    const orderItemsDto = cart.getItems().map((item) => ({
      productId: item.getProductId(),
      quantity: item.getQuantity(),
    }));

    const result = await this.checkoutPort.createOrderFromCart(
      cart.getUserId(),
      orderItemsDto,
      storeId,
    );

    await this.cartRepository.deleteByUserId(command.userId);

    return result;
  }
}
