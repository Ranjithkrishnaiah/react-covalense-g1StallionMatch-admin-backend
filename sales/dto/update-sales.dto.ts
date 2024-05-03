import { PartialType } from '@nestjs/swagger';
import { SalesRequestDto } from './sales-request.dto';

export class UpdateSalesDto extends PartialType(SalesRequestDto) {
  modifiedBy?: number | null;
}
