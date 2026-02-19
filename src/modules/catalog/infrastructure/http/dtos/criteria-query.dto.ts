import { Transform, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

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
}
