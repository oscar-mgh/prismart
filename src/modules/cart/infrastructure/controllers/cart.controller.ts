import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/modules/auth/infrastructure/auth/decorators/get-user.decorator';
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

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(
    private readonly addToCartUseCase: AddToCartUseCase,
    private readonly deleteCartUseCase: DeleteCartUseCase,
    private readonly findCartByUserIdUseCase: FindCartByUserIdUseCase,
    private readonly checkoutUseCase: CheckoutUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findCartByUserId(@GetUser('id', ValidateObjectIdPipe) userId: string): Promise<CartResponseDto> {
    const cart = await this.findCartByUserIdUseCase.execute({ userId });
    return CartMapper.toResponse(cart);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  async addItem(
    @GetUser('id') userId: string,
    @Body() dto: AddItemDto,
    @GetUser('storeId', ValidateObjectIdPipe) storeId: string,
  ): Promise<CartResponseDto> {
    const { productId, quantity } = dto;
    const cart = await this.addToCartUseCase.execute({ userId, productId, quantity }, storeId);
    return CartMapper.toResponse(cart);
  }

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  async checkout(
    @GetUser('id', ValidateObjectIdPipe) userId: string,
    @GetUser('storeId') storeId: string,
  ): Promise<CheckoutResponseDto> {
    return await this.checkoutUseCase.execute({ userId }, storeId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCart(@GetUser('id', ValidateObjectIdPipe) userId: string): Promise<void> {
    await this.deleteCartUseCase.execute({ userId });
  }
}
