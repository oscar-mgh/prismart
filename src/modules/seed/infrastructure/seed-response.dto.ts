import { ApiProperty } from '@nestjs/swagger';

export class SeedResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  storeId: string;

  @ApiProperty({ example: 'My Awesome Store' })
  storeName: string;

  @ApiProperty({ example: 20 })
  productsCreated: number;

  @ApiProperty({ example: 10 })
  reviewsCreated: number;
}
