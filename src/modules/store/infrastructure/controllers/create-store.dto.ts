import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({ example: '123 Main St' })
  @IsString() @IsNotEmpty() street: string;

  @ApiProperty({ example: 'New York' })
  @IsString() @IsNotEmpty() city: string;

  @ApiProperty({ example: 'NY' })
  @IsString() @IsNotEmpty() state: string;

  @ApiProperty({ example: '10001' })
  @IsString() @IsNotEmpty() zipCode: string;

  @ApiProperty({ example: 'US' })
  @IsString() @IsNotEmpty() country: string;
}

export class CreateStoreDto {
  @ApiProperty({ example: 'My Awesome Store' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  address: AddressDto;
}
