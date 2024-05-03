import { ApiProperty } from '@nestjs/swagger';
import { Integer } from 'aws-sdk/clients/apigateway';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class UpdatePromotionDto {
  @ApiProperty()
  @IsNumber()
  promotionId: number;

  @ApiProperty({ example: '2022-06-14' })
  @IsOptional()
  newDate: Date;
}
