import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/modules/auth/infrastructure/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/auth/guards/jwt-auth.guard';
import { PaginatedResult, PaginationQueryDto } from 'src/modules/catalog/infrastructure/http/dtos/pagination.dto';
import { ValidateObjectIdPipe } from 'src/modules/shared/infrastructure/pipes/validate-object-id.pipe';
import { CreateReviewUseCase } from '../../application/use-cases/create-review.use-case';
import { DeleteReviewUseCase } from '../../application/use-cases/delete-review.use-case';
import { FindReviewByIdUseCase } from '../../application/use-cases/find-review-by-id.use-case';
import { FindReviewsByProductUseCase } from '../../application/use-cases/find-reviews-by-product.use-case';
import { UpdateReviewUseCase } from '../../application/use-cases/update-review.use-case';
import { CreateReviewDto } from '../http/dtos/create-review.dto';
import { ReviewResponseDto } from '../http/dtos/review-response.dto';
import { UpdateReviewDto } from '../http/dtos/update-review.dto';
import { ReviewMapper } from '../persistence/mappers/review.mapper';

@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
    private readonly findReviewsByProductUseCase: FindReviewsByProductUseCase,
    private readonly findReviewByIdUseCase: FindReviewByIdUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateReviewDto, @GetUser('id') userId: string): Promise<ReviewResponseDto> {
    const review = await this.createReviewUseCase.execute(dto, userId);
    return ReviewMapper.toResponse(review);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ValidateObjectIdPipe) id: string,
    @Body() dto: UpdateReviewDto,
    @GetUser('id') userId: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.updateReviewUseCase.execute({ id, ...dto }, userId);
    return ReviewMapper.toResponse(review);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ValidateObjectIdPipe) id: string, @GetUser('id') userId: string): Promise<void> {
    await this.deleteReviewUseCase.execute({ id }, userId);
  }

  @Get('product/:productId')
  @HttpCode(HttpStatus.OK)
  async findByProduct(
    @Param('productId', ValidateObjectIdPipe) productId: string,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResult<ReviewResponseDto>> {
    const { page, limit } = query;
    const { data, totalPages, totalElements } = await this.findReviewsByProductUseCase.execute({
      productId,
      page,
      limit,
    });

    return {
      page,
      totalPages,
      totalElements,
      data: data.map((review) => ReviewMapper.toResponse(review)),
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ValidateObjectIdPipe) id: string): Promise<ReviewResponseDto> {
    const review = await this.findReviewByIdUseCase.execute({ id });
    return ReviewMapper.toResponse(review);
  }
}
