import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PRODUCTSDASHBOARDKPI } from 'src/utils/constants/dashboard-kpi';
import { DashboardDto } from 'src/messages/dto/dashboard.dto';

export class DashboardReportDto extends DashboardDto {
  @ApiProperty({ enum: PRODUCTSDASHBOARDKPI })
  @IsString()
  readonly kpiTitle?: string;
}
