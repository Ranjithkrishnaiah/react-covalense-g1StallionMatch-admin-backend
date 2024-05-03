import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateStallionServiceFeeDto {
  @ApiProperty()
  @IsNumber()
  currencyId: number;

  @ApiProperty()
  @IsNumber()
  fee: number;

  @ApiProperty()
  @IsNumber()
  feeYear: number;

  @ApiProperty()
  @IsNumber()
  feeUpdatedFrom: number;

  @ApiProperty()
  isPrivateFee: boolean;

  @ApiProperty()
  @IsNumber()
  stallionId: number;

  createdBy?: number | null;
}
