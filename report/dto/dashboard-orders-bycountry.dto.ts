import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { GroupedBy } from 'src/utils/constants/order';
import { DashboardDto } from 'src/messages/dto/dashboard.dto';

export class DashboardOrdersByCountryDto extends DashboardDto {
  @ApiPropertyOptional()
  @IsOptional()
  countryId?: number;

  @ApiPropertyOptional({ enum: GroupedBy, default: GroupedBy.DAYS })
  @IsEnum(GroupedBy)
  @IsOptional()
  groupedBy?: GroupedBy = GroupedBy.DAYS;
}
