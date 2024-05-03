import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSmProReportDto {
  @ApiProperty()
  @IsNumber()
  orderId: number;

  @ApiProperty()
  @IsString()
  mareId: string;

  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty({
    example: [
      'AC73010C-A8D2-EC11-B1E6-00155D01EE2B',
      '3426D190-3CD5-EC11-B1E6-00155D01EE2B',
    ],
  })
  @IsNotEmpty()
  stallions: Array<string>;
}
