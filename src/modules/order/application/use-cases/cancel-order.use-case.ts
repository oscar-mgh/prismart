import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
    const session = await this.orderRepository.startTransaction();

    try {
      const order = await this.orderRepository.findById(orderId, session);

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

      await this.orderRepository.save(order, session);

      for (const item of order.getItems()) {
        await this.catalogIntegration.updateStockAndPurchaseCount(item.getProductId(), -item.getQuantity(), session);
      }

      await this.orderRepository.commitTransaction(session);
    } catch (error) {
      if (session && session.inTransaction()) {
        await this.orderRepository.rollbackTransaction(session);
      }

      console.error('--- ERROR DE TRANSACCIÓN ---');
      console.error(error);

      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Transaction failed during order cancellation');
    } finally {
      await session.endSession();
    }
  }
}
