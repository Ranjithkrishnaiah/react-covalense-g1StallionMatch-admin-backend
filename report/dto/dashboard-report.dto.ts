import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { DashboardDto } from 'src/messages/dto/dashboard.dto';
import { REPORTDASHBOARDKPI } from 'src/utils/constants/dashboard-kpi';

export class DashboardReportDto extends DashboardDto {
  @ApiProperty({ enum: REPORTDASHBOARDKPI })
  @IsString()
  readonly kpiTitle?: string;
}
