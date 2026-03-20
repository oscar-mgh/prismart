import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/modules/auth/domain/entities/user.entity';
import { GetUser } from 'src/modules/auth/infrastructure/auth/decorators/get-user.decorator';
import { Roles } from 'src/modules/auth/infrastructure/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/auth/guards/jwt-auth.guard';
import { ValidateObjectIdPipe } from 'src/modules/shared/infrastructure/pipes/validate-object-id.pipe';
import { AddToCartUseCase } from '../../application/use-cases/add-to-cart.use-case';
import { CheckoutUseCase } from '../../application/use-cases/checkout.use-case';
import { DeleteCartUseCase } from '../../application/use-cases/delete-cart.use-case';
import { FindCartByUserIdUseCase } from '../../application/use-cases/find-cart-by-user-id.use-case';
import { AddItemDto } from '../http/dtos/add-item.dto';
import { CartResponseDto } from '../http/dtos/cart-response.dto';
import { CheckoutResponseDto } from '../http/dtos/checkout-response.dto';
import { CartMapper } from '../persistence/mappers/cart.mapper';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.CUSTOMER, UserRole.SALES_ADMIN, UserRole.SUPPORT)
export class CartController {
  constructor(
    private readonly addToCartUseCase: AddToCartUseCase,
    private readonly deleteCartUseCase: DeleteCartUseCase,
    private readonly findCartByUserIdUseCase: FindCartByUserIdUseCase,
    private readonly checkoutUseCase: CheckoutUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get the current user cart' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully', type: CartResponseDto })
  @HttpCode(HttpStatus.OK)
  async findCartByUserId(@GetUser('id', ValidateObjectIdPipe) userId: string): Promise<CartResponseDto> {
    const cart = await this.findCartByUserIdUseCase.execute({ userId });
    return CartMapper.toResponse(cart);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item to the cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart', type: CartResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @HttpCode(HttpStatus.CREATED)
  async addItem(
    @Body() dto: AddItemDto,
    @GetUser('id', ValidateObjectIdPipe) userId: string,
  ): Promise<CartResponseDto> {
    const cart = await this.addToCartUseCase.execute({ ...dto, userId });
    return CartMapper.toResponse(cart);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout the current cart and create an order' })
  @ApiResponse({ status: 201, description: 'Checkout completed, order created', type: CheckoutResponseDto })
  @ApiResponse({ status: 400, description: 'Cart is empty or invalid' })
  @HttpCode(HttpStatus.CREATED)
  async checkout(@GetUser('id', ValidateObjectIdPipe) userId: string): Promise<CheckoutResponseDto> {
    return await this.checkoutUseCase.execute({ userId });
  }

  @Delete()
  @ApiOperation({ summary: 'Delete the current user cart' })
  @ApiResponse({ status: 204, description: 'Cart deleted successfully' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCart(@GetUser('id', ValidateObjectIdPipe) userId: string): Promise<void> {
    await this.deleteCartUseCase.execute({ userId });
  }
}
