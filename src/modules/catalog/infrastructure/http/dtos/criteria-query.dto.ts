import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CriteriaQueryDto {
  @IsOptional()
  @IsArray()
  ids?: string[];

  @IsOptional()
  @Type(() => String)
  @IsArray()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  skus?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortByPurchaseCount: 'asc' | 'desc' = 'desc';
}
