import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductInfoPort } from 'src/modules/catalog/domain/ports/product-info.port';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { Cart } from '../../domain/entities/cart.entity';
import { CartRepositoryPort } from '../../domain/ports/cart-repository.port';
import { AddToCartCommand } from './commands/add-to-cart.command';
import { IdGenerator } from 'src/modules/shared/infrastructure/id-generator.service';

@Injectable()
export class AddToCartUseCase {
  constructor(
    private readonly cartRepository: CartRepositoryPort,
    private readonly productInfo: ProductInfoPort,
  ) {}

  async execute(command: AddToCartCommand): Promise<Cart> {
    const { userId, productId, quantity } = command;
    const [product] = await this.productInfo.getProductsInfo([productId]);
    if (!product) throw new NotFoundException('Product not found');

    let cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      cart = new Cart(Id.fromString(IdGenerator.next().getValue()), userId, []);
    }

    const existingItem = cart.getItems().find((item) => item.getProductId() === productId);
    const totalQuantity = (existingItem?.getQuantity() ?? 0) + quantity;

    if (product.availableStock < totalQuantity) {
      throw new BadRequestException(`Insufficient stock. Max available: ${product.availableStock}`);
    }

    cart.updateProductQuantity(productId, quantity);

    return await this.cartRepository.save(cart);
  }
}

