import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Orders')
@ApiBearerAuth()
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
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created', type: OrderResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrderDto, @GetUser('id') userId: string): Promise<OrderResponseDto> {
    const order = await this.createOrderUseCase.execute({
      customerId: userId,
      items: dto.items,
    });
    return OrderMapper.toResponse(order);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all customer orders (SUPPORT / SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'All orders retrieved', type: [OrderResponseDto] })
  @ApiResponse({ status: 403, description: 'Forbidden — requires SUPPORT or SUPER_ADMIN role' })
  @Roles(UserRole.SUPPORT, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async findAllCustomersOrders(): Promise<OrderResponseDto[]> {
    const orders = await this.GetAllCustomerOrdersUseCase.execute();
    return orders.map((order) => OrderMapper.toResponse(order));
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get orders for a specific customer' })
  @ApiParam({ name: 'customerId', description: 'Customer user ID' })
  @ApiResponse({ status: 200, description: 'Customer orders retrieved', type: [OrderResponseDto] })
  @ApiResponse({ status: 403, description: 'Forbidden — can only view own orders' })
  @HttpCode(HttpStatus.OK)
  async findCustomerOrders(
    @Param('customerId', ValidateObjectIdPipe) customerId: string,
    @GetUser('id') userId: string,
  ): Promise<OrderResponseDto[]> {
    const orders = await this.getCustomerOrdersUseCase.execute({ customerId, userId });
    return orders.map((order) => OrderMapper.toResponse(order));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Order found', type: OrderResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @HttpCode(HttpStatus.OK)
  async findById(
    @Param('id', ValidateObjectIdPipe) id: string,
    @GetUser('id') userId: string,
  ): Promise<OrderResponseDto> {
    const order = await this.getOrderUseCase.execute({ orderId: id, userId });
    return OrderMapper.toResponse(order);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 204, description: 'Order cancelled' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancel(@Param('id', ValidateObjectIdPipe) id: string, @GetUser('id') userId: string): Promise<void> {
    await this.cancelOrderUseCase.execute({ orderId: id, userId });
  }
}
