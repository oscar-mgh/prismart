import { ApiProperty } from '@nestjs/swagger';

export class ApplyDiscountResponseDto {
  @ApiProperty({ example: 'Discount applied successfully to the selected products!' })
  readonly message: string;

  @ApiProperty({ example: 12 })
  readonly affectedProducts: number;

  @ApiProperty({ example: '2026-03-20T20:00:00.000Z' })
  readonly timestamp: string;

  constructor(message: string, affectedProducts: number) {
    this.message = message;
    this.affectedProducts = affectedProducts;
    this.timestamp = new Date().toISOString();
  }
}
