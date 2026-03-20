import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { Cart } from '../../domain/entities/cart.entity';
import { CartItem } from '../../domain/value-objects/cart-item.vo';
import { CartRepositoryPort } from '../../domain/ports/cart-repository.port';
import { CheckoutPort, CheckoutResult } from '../../domain/ports/checkout.port';
import { CheckoutUseCase } from './checkout.use-case';

const VALID_ID = Id.fromString('aabbccddee11223344556677');

describe('CheckoutUseCase', () => {
  let useCase: CheckoutUseCase;
  let cartRepository: jest.Mocked<CartRepositoryPort>;
  let checkoutPort: jest.Mocked<CheckoutPort>;

  beforeEach(() => {
    cartRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
      deleteByUserId: jest.fn(),
    } as jest.Mocked<CartRepositoryPort>;

    checkoutPort = {
      createOrderFromCart: jest.fn(),
    } as jest.Mocked<CheckoutPort>;

    useCase = new CheckoutUseCase(cartRepository, checkoutPort);
  });

  it('should checkout successfully and delete the cart', async () => {
    const cart = new Cart(VALID_ID, 'user-1', [new CartItem('prod-1', 2), new CartItem('prod-2', 1)]);
    const expectedResult: CheckoutResult = {
      orderId: 'order-1',
      totalAmount: 250,
      status: 'PENDING',
      createdAt: new Date(),
      items: [
        { productId: 'prod-1', name: 'A', price: 100, quantity: 2 },
        { productId: 'prod-2', name: 'B', price: 50, quantity: 1 },
      ],
    };

    cartRepository.findByUserId.mockResolvedValue(cart);
    checkoutPort.createOrderFromCart.mockResolvedValue(expectedResult);
    cartRepository.deleteByUserId.mockResolvedValue();

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toEqual(expectedResult);
    expect(checkoutPort.createOrderFromCart).toHaveBeenCalledWith('user-1', [
      { productId: 'prod-1', quantity: 2 },
      { productId: 'prod-2', quantity: 1 },
    ]);
    expect(cartRepository.deleteByUserId).toHaveBeenCalledWith('user-1');
  });

  it('should throw if cart is not found', async () => {
    cartRepository.findByUserId.mockResolvedValue(null);

    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow('Cannot checkout an empty cart');
  });

  it('should throw if cart has no items', async () => {
    const emptyCart = new Cart(VALID_ID, 'user-1', []);
    cartRepository.findByUserId.mockResolvedValue(emptyCart);

    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow('Cannot checkout an empty cart');
  });
});
