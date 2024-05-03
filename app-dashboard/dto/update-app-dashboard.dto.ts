import { PartialType } from '@nestjs/swagger';
import { CreateAppDashboardDto } from './create-app-dashboard.dto';

export class UpdateAppDashboardDto extends PartialType(CreateAppDashboardDto) {}
