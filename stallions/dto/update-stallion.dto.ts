import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateStallionDto } from './create-stallion.dto';

export class UpdateStallionDto extends PartialType(CreateStallionDto) {
  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isProfileImageDeleted: boolean;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  modifiedBy?: number | null;

  @ApiProperty({ example: '2022-06-14' })
  @IsOptional()
  startDate: Date;

  @ApiProperty({ default:false })
  @IsOptional()
  isPromotionUpdated: Boolean;

  endDate?: Date | null;
}
