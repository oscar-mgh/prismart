import { Injectable } from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity';
import { OrderRepositoryPort } from '../../domain/ports/order-repository.port';

@Injectable()
export class GetAllCustomerOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepositoryPort) {}

  async execute(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }
}
