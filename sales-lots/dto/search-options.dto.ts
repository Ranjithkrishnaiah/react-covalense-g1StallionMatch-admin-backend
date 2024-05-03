import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ToBoolean } from 'src/utils/to-boolean';

export class SearchOptionsDto {
  @ApiProperty()
  @IsString()
  saleId: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  lotRange: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  isWithdrawn: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  NotMatchedLot: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  NotMatchedSireDam: boolean;
}
