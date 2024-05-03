import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class ReorderItemDto {
  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsUUID()
  @IsNotEmpty()
  sourceId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sourcePosition: number;

  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsNotEmpty()
  @IsUUID()
  destinationId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  destinationPosition: number;
}
