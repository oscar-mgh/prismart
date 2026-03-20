import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { Cart } from '../../domain/entities/cart.entity';
import { CartItem } from '../../domain/value-objects/cart-item.vo';
import { CartRepositoryPort } from '../../domain/ports/cart-repository.port';
import { ProductInfoPort, ProductInfo } from 'src/modules/shared/domain/ports/product-info.port';
import { AddToCartUseCase } from './add-to-cart.use-case';

const VALID_ID = Id.fromString('aabbccddee11223344556677');

describe('AddToCartUseCase', () => {
  let useCase: AddToCartUseCase;
  let cartRepository: jest.Mocked<CartRepositoryPort>;
  let productInfo: jest.Mocked<ProductInfoPort>;

  const productData: ProductInfo = {
    productId: 'prod-1',
    name: 'Product A',
    price: 100,
    availableStock: 10,
  };

  beforeEach(() => {
    cartRepository = {
      findByUserId: jest.fn(),
      save: jest.fn().mockImplementation(async (cart) => cart),
      deleteByUserId: jest.fn(),
    } as jest.Mocked<CartRepositoryPort>;

    productInfo = {
      getProductsInfo: jest.fn(),
    } as jest.Mocked<ProductInfoPort>;

    useCase = new AddToCartUseCase(cartRepository, productInfo);
  });

  it('should add a product to a new cart', async () => {
    productInfo.getProductsInfo.mockResolvedValue([productData]);
    cartRepository.findByUserId.mockResolvedValue(null);

    const result = await useCase.execute({ userId: 'user-1', productId: 'prod-1', quantity: 3 });

    expect(result.getItems()).toHaveLength(1);
    expect(result.getItems()[0].getQuantity()).toBe(3);
    expect(cartRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException if product does not exist', async () => {
    productInfo.getProductsInfo.mockResolvedValue([undefined as any]);

    await expect(
      useCase.execute({ userId: 'user-1', productId: 'non-existent', quantity: 1 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if stock is insufficient', async () => {
    productInfo.getProductsInfo.mockResolvedValue([productData]); // stock: 10
    cartRepository.findByUserId.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: 'user-1', productId: 'prod-1', quantity: 15 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if adding exceeds stock for existing cart item', async () => {
    const existingCart = new Cart(VALID_ID, 'user-1', [new CartItem('prod-1', 8)]);
    productInfo.getProductsInfo.mockResolvedValue([productData]); // stock: 10
    cartRepository.findByUserId.mockResolvedValue(existingCart);

    await expect(
      useCase.execute({ userId: 'user-1', productId: 'prod-1', quantity: 5 }), // 8 + 5 = 13 > 10
    ).rejects.toThrow(BadRequestException);
  });
});
