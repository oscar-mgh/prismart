import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { Cart } from '../../../domain/entities/cart.entity';
import { CartItem } from '../../../domain/value-objects/cart-item.vo';
import { CartResponseDto } from '../../http/dtos/cart-response.dto';
import { CartDocument } from '../schemas/cart.schema';
import { CartPersistenceDto } from '../dtos/cart-persistence.dto';

export class CartMapper {
  static toDomain(doc: CartDocument): Cart {
    const items = doc.items.map((item) => new CartItem(item.productId, item.quantity));

    return new Cart(Id.fromString(doc._id.toString()), doc.userId, items);
  }

  static toPersistence(cart: Cart): CartPersistenceDto {
    return {
      _id: cart.id.getValue(),
      userId: cart.getUserId(),
      items: cart.getItems().map((item) => ({
        productId: item.getProductId(),
        quantity: Number(item.getQuantity()),
      })),
      updatedAt: cart.getUpdatedAt(),
    };
  }

  static toResponse(cart: Cart): CartResponseDto {
    return {
      id: cart.id.getValue(),
      userId: cart.getUserId(),
      items: cart.getItems().map((item) => ({
        productId: item.getProductId(),
        quantity: item.getQuantity(),
      })),
      updatedAt: cart.getUpdatedAt(),
      totalItems: cart.getTotalItems(),
    };
  }
}
