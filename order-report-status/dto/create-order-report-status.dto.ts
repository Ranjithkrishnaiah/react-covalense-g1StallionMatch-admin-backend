import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateOrderReportStatusDto {
  @ApiProperty()
  @IsNotEmpty()
  orderProductId: number;

  @ApiProperty()
  @IsNotEmpty()
  orderStatusId: number;

  @ApiProperty()
  @IsNotEmpty()
  createdBy: number;
}
