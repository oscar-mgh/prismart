import { ForbiddenException, Injectable } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { OrderRepositoryPort } from '../../domain/ports/order-repository.port';
import { GetCustomerOrdersQuery } from './queries/get-customer-orders.query';

@Injectable()
export class GetCustomerOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepositoryPort) {}

  async execute(query: GetCustomerOrdersQuery): Promise<Order[]> {
    if (query.customerId !== query.userId) {
      throw new ForbiddenException('You are not allowed to get orders for another user');
    }
    return this.orderRepository.findByCustomerId(query.customerId);
  }
}
