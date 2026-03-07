import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { Order } from '../../../domain/entities/order.entity';
import { OrderItem } from '../../../domain/value-objects/order-item.vo';
import { OrderDocument } from '../schemas/order.schema';
import { OrderResponseDto } from '../../http/dtos/order-response.dto';

export class OrderMapper {
  static toDomain(doc: OrderDocument): Order {
    const items = doc.items.map((i) => new OrderItem(i.productId, i.productName, i.unitPrice, i.quantity));

    return new Order(
      Id.fromString(doc._id.toString()),
      doc.customerId,
      items,
      doc.status as any,
      true,
      new Date(doc.createdAt),
    );
  }

  static toPersistence(order: Order): any {
    return {
      _id: order.id.getValue(),
      customerId: order.getCustomerId(),
      items: order.getItems().map((i) => ({
        productId: i.getProductId(),
        productName: i.getProductName(),
        unitPrice: i.getUnitPrice(),
        quantity: i.getQuantity(),
      })),
      status: order.getStatus(),
      totalAmount: order.getTotalAmount(),
    };
  }

  static toResponse(order: Order): OrderResponseDto {
    return {
      id: order.id.getValue(),
      customerId: order.getCustomerId(),
      status: order.getStatus(),
      totalAmount: order.getTotalAmount(),
      createdAt: order.getCreatedAt(),
      items: order.getItems().map((item) => ({
        productId: item.getProductId(),
        name: item.getProductName(),
        price: item.getUnitPrice(),
        quantity: item.getQuantity(),
        subtotal: item.getUnitPrice() * item.getQuantity(),
      })),
    };
  }
}
