import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class ReportPageSettingsDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ example: { name: 'Date', value: 'Date' } })
  @IsOptional()
  defaultDisplay: object;

  @ApiProperty({ example: 'exampe@email.com' })
  @IsOptional()
  sendFrom: string;

  @ApiProperty({ example: 'exampe@email.com' })
  @IsOptional()
  replyTo: string;

  @ApiProperty({ example: 0 })
  @IsOptional()
  approvalAutomation: boolean;

  @ApiProperty({ example: 0 })
  @IsOptional()
  deliveryAutomation: boolean;

  @ApiProperty({ example: 0 })
  @IsOptional()
  startDate: boolean;
}
