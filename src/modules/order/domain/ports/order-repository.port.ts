import { Order } from '../entities/order.entity';

export abstract class OrderRepositoryPort {
  abstract save(order: Order, session?: any): Promise<Order>;

  abstract findById(id: string, session?: any): Promise<Order | null>;

  abstract findByCustomerId(customerId: string): Promise<Order[]>;

  abstract findAll(): Promise<Order[]>;

  abstract startTransaction(): Promise<any>;

  abstract commitTransaction(session: any): Promise<void>;

  abstract rollbackTransaction(session: any): Promise<void>;
}
