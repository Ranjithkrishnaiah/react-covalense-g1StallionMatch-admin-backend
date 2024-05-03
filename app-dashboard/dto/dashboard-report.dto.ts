import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { APPDASHBOARDKPI } from 'src/utils/constants/dashboard-kpi';
import { AppDashboardDto } from './app-dashboard.dto';

export class DashboardReportDto extends AppDashboardDto {
  @ApiProperty({ enum: APPDASHBOARDKPI })
  @IsString()
  readonly kpiTitle?: string;
}
