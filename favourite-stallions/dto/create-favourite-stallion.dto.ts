import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateFavouriteStallionDto {
  @ApiProperty({ example: 'ABD9467E-90C4-EC11-B1E4-00155D01EE2B' })
  @IsUUID()
  stallionUuid: string;

  @IsOptional()
  @IsNumber()
  memberId: number;

  stallionId?: number | null; //why we need stallionId??? you have already stallionUuid
  createdBy?: number | null;
}
