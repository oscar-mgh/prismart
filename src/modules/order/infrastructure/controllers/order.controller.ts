import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from 'src/modules/auth/domain/entities/user.entity';
import { GetUser } from 'src/modules/auth/infrastructure/auth/decorators/get-user.decorator';
import { Roles } from 'src/modules/auth/infrastructure/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/infrastructure/auth/guards/roles.guard';
import { ValidateObjectIdPipe } from 'src/modules/shared/infrastructure/pipes/validate-object-id.pipe';
import { CancelOrderUseCase } from '../../application/use-cases/cancel-order.use-case';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { GetAllCustomerOrdersUseCase } from '../../application/use-cases/get-all-customers-orders.use-case';
import { GetCustomerOrdersUseCase } from '../../application/use-cases/get-customer-orders.use-case';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case';
import { CreateOrderDto } from '../http/create-order.dto';
import { OrderResponseDto } from '../http/dtos/order-response.dto';
import { OrderMapper } from '../persistence/mappers/order.mapper';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly getCustomerOrdersUseCase: GetCustomerOrdersUseCase,
    private readonly GetAllCustomerOrdersUseCase: GetAllCustomerOrdersUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrderDto, @GetUser('id') userId: string): Promise<OrderResponseDto> {
    const order = await this.createOrderUseCase.execute({
      customerId: userId,
      items: dto.items,
    });
    return OrderMapper.toResponse(order);
  }

  @Get('all')
  @Roles(UserRole.SUPPORT, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async findAllCustomersOrders(): Promise<OrderResponseDto[]> {
    const orders = await this.GetAllCustomerOrdersUseCase.execute();
    return orders.map((order) => OrderMapper.toResponse(order));
  }

  @Get('customer/:customerId')
  @HttpCode(HttpStatus.OK)
  async findCustomerOrders(
    @Param('customerId', ValidateObjectIdPipe) customerId: string,
    @GetUser('id') userId: string,
  ): Promise<OrderResponseDto[]> {
    const orders = await this.getCustomerOrdersUseCase.execute({ customerId, userId });
    return orders.map((order) => OrderMapper.toResponse(order));
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('id', ValidateObjectIdPipe) id: string,
    @GetUser('id') userId: string,
  ): Promise<OrderResponseDto> {
    const order = await this.getOrderUseCase.execute({ orderId: id, userId });
    return OrderMapper.toResponse(order);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(@Param('id', ValidateObjectIdPipe) id: string, @GetUser('id') userId: string): Promise<void> {
    await this.cancelOrderUseCase.execute({ orderId: id, userId });
  }
}
