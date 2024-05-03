import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateStallionPromotionDto {
  @ApiProperty({ example: 'ABD9467E-90C4-EC11-B1E4-00155D01EE2B' })
  @IsUUID()
  stallionUuid: string;

  @ApiProperty({ example: '2022-06-14' })
  @IsOptional()
  startDate: Date;

  endDate?: Date | null;

  createdBy?: number | null;
  stallionId?: number | null; //Why stallionId required?, we have stallionUuid already
}
