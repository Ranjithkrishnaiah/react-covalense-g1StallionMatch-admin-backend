import { PartialType } from '@nestjs/swagger';
import { CreateOrderReportStatusDto } from './create-order-report-status.dto';

export class UpdateOrderReportDto extends PartialType(
  CreateOrderReportStatusDto,
) {}
