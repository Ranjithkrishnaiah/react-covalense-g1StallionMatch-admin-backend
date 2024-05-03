import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PricingTileType } from 'src/utils/constants/pricing-tile';

export class PricingTileTypeDto {
  @ApiProperty({ enum: PricingTileType, default: PricingTileType.FREE })
  @IsEnum(PricingTileType)
  readonly type: PricingTileType = PricingTileType.FREE;
}
