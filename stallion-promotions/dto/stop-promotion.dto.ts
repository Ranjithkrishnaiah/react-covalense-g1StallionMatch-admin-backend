import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class StopStallionPromotionDto {
  @ApiProperty({ example: '2022-06-14' })
  @IsOptional()
  effectiveDate: Date;
}
