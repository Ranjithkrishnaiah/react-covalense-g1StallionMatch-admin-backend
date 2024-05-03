import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateFavouriteMareDto {
  @ApiProperty({ example: '3580DC13-6EC1-EC11-B1E4-00155D01EE2B' })
  @IsUUID()
  horseUuid: string;

  @IsOptional()
  @IsNumber()
  memberId: number;

  mareId?: number | null; // Don't know why mareId added here, you have already horseUuid
  createdBy?: number | null;
}
