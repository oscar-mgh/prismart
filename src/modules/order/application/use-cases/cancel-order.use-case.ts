import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import { CatalogIntegrationPort } from '../../domain/ports/catalog-integration.port';
import { OrderRepositoryPort } from '../../domain/ports/order-repository.port';
import { CancelOrderCommand } from './commands/cancel-order.command';

@Injectable()
export class CancelOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepositoryPort,
    private readonly catalogIntegration: CatalogIntegrationPort,
  ) {}

  async execute(command: CancelOrderCommand): Promise<void> {
    const { orderId, userId } = command;
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.getCustomerId() !== userId) {
      throw new BadRequestException('You cannot cancel an order that does not belong to you');
    }

    if (order.getStatus() !== OrderStatus.PENDING) {
      throw new BadRequestException(`Cannot cancel order in ${order.getStatus()} status`);
    }

    order.cancel();

    await this.orderRepository.save(order);

    for (const item of order.getItems()) {
      await this.catalogIntegration.updateStockAndPurchaseCount(item.getProductId(), -item.getQuantity());
    }
  }
}
