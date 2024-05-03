import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { RUNNERDASHBOARDKPI } from 'src/utils/constants/dashboard-kpi';
import { DashboardDto } from './dashboard.dto';

export class DashboardReportDto extends DashboardDto {
  @ApiProperty({ enum: RUNNERDASHBOARDKPI })
  @IsString()
  readonly kpiTitle?: string;
}
