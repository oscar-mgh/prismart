import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../../../domain/entities/order.entity';
import { OrderRepositoryPort } from '../../../domain/ports/order-repository.port';
import { OrderMapper } from '../mappers/order.mapper';
import { OrderDocument } from '../schemas/order.schema';

@Injectable()
export class MongooseOrderRepository implements OrderRepositoryPort {
  constructor(
    @InjectModel(OrderDocument.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async save(order: Order, session?: any): Promise<Order> {
    const persistenceData = OrderMapper.toPersistence(order);

    const savedDoc = await this.orderModel
      .findByIdAndUpdate(persistenceData._id, persistenceData, { upsert: true, new: true, session })
      .exec();

    return OrderMapper.toDomain(savedDoc);
  }

  async findById(id: string, session?: any): Promise<Order | null> {
    const doc = await this.orderModel.findById(id).session(session).exec();
    return doc ? OrderMapper.toDomain(doc) : null;
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const docs = await this.orderModel.find({ customerId }).exec();
    return docs.map((doc) => OrderMapper.toDomain(doc));
  }

  async findAll(): Promise<Order[]> {
    const docs = await this.orderModel.find().exec();
    return docs.map((doc) => OrderMapper.toDomain(doc));
  }
  async startTransaction(): Promise<any> {
    const session = await this.orderModel.db.startSession();
    session.startTransaction();
    return session;
  }

  async commitTransaction(session: any): Promise<void> {
    await session.commitTransaction();
  }

  async rollbackTransaction(session: any): Promise<void> {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
  }
}
