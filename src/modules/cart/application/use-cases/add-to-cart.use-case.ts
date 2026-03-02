import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CatalogIntegrationPort } from 'src/modules/order/domain/ports/catalog-integration.port';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { Cart } from '../../domain/entities/cart.entity';
import { CartRepositoryPort } from '../../domain/ports/cart-repository.port';
import { AddToCartCommand } from './commands/add-to-cart.command';

@Injectable()
export class AddToCartUseCase {
  constructor(
    private readonly cartRepository: CartRepositoryPort,
    private readonly catalogIntegration: CatalogIntegrationPort,
  ) {}

  async execute(command: AddToCartCommand): Promise<Cart> {
    const { userId, productId, quantity } = command;
    const [product] = await this.catalogIntegration.getProductsInfo([productId]);
    if (!product) throw new NotFoundException('Product not found');

    if (product.availableStock < quantity) {
      throw new BadRequestException(`Insufficient stock. Max available: ${product.availableStock}`);
    }

    let cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      cart = new Cart(new Id(), userId, []);
    }

    cart.updateProductQuantity(productId, quantity);

    return await this.cartRepository.save(cart);
  }
}
