import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User, UserRole } from 'src/modules/auth/domain/entities/user.entity';
import { GetUser } from 'src/modules/auth/infrastructure/auth/decorators/get-user.decorator';
import { Roles } from 'src/modules/auth/infrastructure/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/infrastructure/auth/guards/roles.guard';
import { ValidateObjectIdPipe } from 'src/modules/shared/infrastructure/pipes/validate-object-id.pipe';
import { ApplyDiscountUseCase } from '../../application/use-cases/apply-discount.use-case';
import { ApplyDiscountCommand } from '../../application/use-cases/commands/apply-discount.command';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import { FindAllProductsUseCase } from '../../application/use-cases/find-all-products.use-case';
import { GetAllCategoriesUseCase } from '../../application/use-cases/get-all-categories.use-case';
import { FindByCriteriaUseCase } from '../../application/use-cases/find-by-criteria-use-case';
import { FindProductByIdUseCase } from '../../application/use-cases/find-product-by-id.use-case';
import { UploadProductImageUseCase } from '../../application/use-cases/upload-product-image.use-case';
import { ReviewIntegrationPort } from '../../domain/ports/review-integration.port';
import { ApplyDiscountResponseDto } from '../http/dtos/apply-discount-response.dto';
import { ApplyDiscountDto } from '../http/dtos/apply-discount.dto';
import { CreateProductDto } from '../http/dtos/create-product.dto';
import { GetProductsQueryDto } from '../http/dtos/get-products-query.dto';
import { CriteriaQueryDto } from '../http/dtos/criteria-query.dto';
import { PaginatedResult } from '../http/dtos/pagination.dto';
import { ProductResponseDto } from '../http/dtos/product-response.dto';
import { ProductMapper } from '../persistence/mappers/product.mapper';

@Controller('products')
export class ProductController {
  constructor(
    private readonly findAllProductsUseCase: FindAllProductsUseCase,
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly applyDiscountUseCase: ApplyDiscountUseCase,
    private readonly findByCriteriaUseCase: FindByCriteriaUseCase,
    private readonly uploadProductImageUseCase: UploadProductImageUseCase,
    private readonly reviewIntegration: ReviewIntegrationPort,
    private readonly getAllCategoriesUseCase: GetAllCategoriesUseCase,
  ) {}

  @Get('categories')
  @HttpCode(HttpStatus.OK)
  async findAllCategories(): Promise<string[]> {
    return this.getAllCategoriesUseCase.execute();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: GetProductsQueryDto): Promise<PaginatedResult<ProductResponseDto>> {
    const { page, totalElements, totalPages, data } = await this.findAllProductsUseCase.execute(query);

    return {
      page,
      totalPages,
      totalElements,
      data: data.map((item) => ProductMapper.toResponse(item.product, item.averageRating)),
    };
  }

  @Get('criteria')
  @HttpCode(HttpStatus.OK)
  async findByCriteria(@Query() query: CriteriaQueryDto): Promise<PaginatedResult<ProductResponseDto>> {
    const { page, totalElements, totalPages, data } = await this.findByCriteriaUseCase.execute(query);

    return {
      page,
      totalPages,
      totalElements,
      data: data.map((item) => ProductMapper.toResponse(item.product, item.averageRating)),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ValidateObjectIdPipe) id: string): Promise<ProductResponseDto> {
    const product = await this.findProductByIdUseCase.execute({ id });
    const averageRating = await this.reviewIntegration.getAverageRating(id);
    return ProductMapper.toResponse(product, averageRating);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SALES_ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProductDto, @GetUser() user: User): Promise<ProductResponseDto> {
    if (!user.storeId) throw new ForbiddenException('User must be associated with a store to create a product');
    const product = await this.createProductUseCase.execute(dto, user.storeId.toString());
    return ProductMapper.toResponse(product);
  }

  @Patch('apply-discount')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SALES_ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async applyDiscount(@Body() dto: ApplyDiscountDto): Promise<ApplyDiscountResponseDto> {
    const { ids, skus, category, code, percentage, expirationDate } = dto;
    const command: ApplyDiscountCommand = {
      criteria: {
        ids,
        category,
        skus,
      },
      discountData: {
        code,
        percentage,
        expirationDate: new Date(expirationDate),
      },
    };
    const affectedProducts = await this.applyDiscountUseCase.execute(command);
    const response: ApplyDiscountResponseDto = {
      message: 'Discount applied successfully to the selected products!',
      affectedProducts,
      timestamp: new Date().toISOString(),
    };
    return response;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SALES_ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ValidateObjectIdPipe) id: string): Promise<void> {
    return await this.deleteProductUseCase.execute({ id });
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SALES_ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadImage(
    @Param('id', ValidateObjectIdPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    const product = await this.uploadProductImageUseCase.execute({
      productId: id,
      file,
    });
    return ProductMapper.toResponse(product);
  }
}
