import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CatalogIntegrationPort, ProductStockInfo } from '../../domain/ports/catalog-integration.port';
import { OrderRepositoryPort } from '../../domain/ports/order-repository.port';
import { CreateOrderUseCase } from './create-order.use-case';
import { CreateOrderCommand } from './commands/create-order.command';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let orderRepository: jest.Mocked<OrderRepositoryPort>;
  let catalogIntegration: jest.Mocked<CatalogIntegrationPort>;

  const productsInfo: ProductStockInfo[] = [
    { productId: 'prod-1', name: 'Product A', price: 100, availableStock: 10 },
    { productId: 'prod-2', name: 'Product B', price: 50, availableStock: 5 },
  ];

  beforeEach(() => {
    orderRepository = {
      save: jest.fn().mockImplementation(async (order) => order),
      findById: jest.fn(),
      findByCustomerId: jest.fn(),
      findAll: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
    } as any;

    catalogIntegration = {
      getProductsInfo: jest.fn(),
      updateStockAndPurchaseCount: jest.fn(),
    } as jest.Mocked<CatalogIntegrationPort>;

    useCase = new CreateOrderUseCase(orderRepository, catalogIntegration);
  });

  it('should create an order successfully', async () => {
    catalogIntegration.getProductsInfo.mockResolvedValue(productsInfo);
    catalogIntegration.updateStockAndPurchaseCount.mockResolvedValue(true);

    const command: CreateOrderCommand = {
      customerId: 'customer-1',
      items: [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 1 },
      ],
    };

    const result = await useCase.execute(command);

    expect(result.getCustomerId()).toBe('customer-1');
    expect(result.getItems()).toHaveLength(2);
    expect(result.getTotalAmount()).toBe(250); // 100*2 + 50*1
    expect(catalogIntegration.updateStockAndPurchaseCount).toHaveBeenCalledTimes(2);
    expect(orderRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException if a product is not found', async () => {
    catalogIntegration.getProductsInfo.mockResolvedValue([productsInfo[0]]); // only prod-1

    const command: CreateOrderCommand = {
      customerId: 'customer-1',
      items: [
        { productId: 'prod-1', quantity: 1 },
        { productId: 'prod-999', quantity: 1 },
      ],
    };

    await expect(useCase.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if stock is insufficient', async () => {
    catalogIntegration.getProductsInfo.mockResolvedValue(productsInfo);
    catalogIntegration.updateStockAndPurchaseCount.mockResolvedValue(false);

    const command: CreateOrderCommand = {
      customerId: 'customer-1',
      items: [{ productId: 'prod-1', quantity: 100 }],
    };

    await expect(useCase.execute(command)).rejects.toThrow(BadRequestException);
  });
});
