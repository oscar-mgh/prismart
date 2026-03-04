import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';

export enum ProductSortBy {
  RECENT = 'recent',
  PRICE_HIGH = 'price_high',
  PRICE_LOW = 'price_low',
  BEST_SELLING = 'best_selling',
  BEST_RATED = 'best_rated',
}

export class GetProductsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy = ProductSortBy.RECENT;
}