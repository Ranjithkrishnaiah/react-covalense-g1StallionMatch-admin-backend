import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { AppDashboardDto } from './app-dashboard.dto';

export class TopVisitedFarmsDto extends PartialType(AppDashboardDto) {
  @ApiPropertyOptional()
  @IsOptional()
  readonly limit?: number;
}
