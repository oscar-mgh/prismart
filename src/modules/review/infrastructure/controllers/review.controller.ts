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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/modules/auth/infrastructure/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/auth/guards/jwt-auth.guard';
import { PaginatedResult, PaginationQueryDto } from 'src/modules/catalog/infrastructure/http/dtos/pagination.dto';
import { ValidateObjectIdPipe } from 'src/modules/shared/infrastructure/pipes/validate-object-id.pipe';
import { CreateReviewUseCase } from '../../application/use-cases/create-review.use-case';
import { DeleteReviewUseCase } from '../../application/use-cases/delete-review.use-case';
import { FindReviewByIdUseCase } from '../../application/use-cases/find-review-by-id.use-case';
import { FindReviewsByProductUseCase } from '../../application/use-cases/find-reviews-by-product.use-case';
import { UpdateReviewUseCase } from '../../application/use-cases/update-review.use-case';
import { UploadReviewImageUseCase } from '../../application/use-cases/upload-review-image.use-case';
import { CreateReviewDto } from '../http/dtos/create-review.dto';
import { ReviewResponseDto } from '../http/dtos/review-response.dto';
import { UpdateReviewDto } from '../http/dtos/update-review.dto';
import { ReviewMapper } from '../persistence/mappers/review.mapper';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
    private readonly findReviewsByProductUseCase: FindReviewsByProductUseCase,
    private readonly findReviewByIdUseCase: FindReviewByIdUseCase,
    private readonly uploadReviewImageUseCase: UploadReviewImageUseCase,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created', type: ReviewResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateReviewDto, @GetUser('id') userId: string): Promise<ReviewResponseDto> {
    const review = await this.createReviewUseCase.execute(dto, userId);
    return ReviewMapper.toResponse(review);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review updated', type: ReviewResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden — can only update own reviews' })
  @ApiResponse({ status: 404, description: 'Review not found' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 204, description: 'Review deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden — can only delete own reviews' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ValidateObjectIdPipe) id: string, @GetUser('id') userId: string): Promise<void> {
    await this.deleteReviewUseCase.execute({ id }, userId);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get reviews for a product (paginated)' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Paginated list of reviews' })
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
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Review found', type: ReviewResponseDto })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id', ValidateObjectIdPipe) id: string): Promise<ReviewResponseDto> {
    const review = await this.findReviewByIdUseCase.execute({ id });
    return ReviewMapper.toResponse(review);
  }

  @Post(':id/image')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a review image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, description: 'Image uploaded', type: ReviewResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async uploadImage(
    @Param('id', ValidateObjectIdPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
  ): Promise<ReviewResponseDto> {
    const review = await this.uploadReviewImageUseCase.execute(
      { reviewId: id, file },
      userId,
    );
    return ReviewMapper.toResponse(review);
  }
}
