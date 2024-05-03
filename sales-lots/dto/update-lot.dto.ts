import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateLotDto {
  @ApiProperty({ example: true })
  @IsOptional()
  isVerifiedSire: boolean;

  @ApiProperty({ example: true })
  @IsOptional()
  isVerifiedDam: boolean;

  @ApiProperty({ example: true })
  @IsOptional()
  isVerified: boolean;

  @ApiProperty()
  @IsOptional()
  horseId: string;

  @ApiProperty()
  @IsOptional()
  horseName: string;

  @ApiProperty()
  @IsOptional()
  horseYob: string;

  @ApiProperty()
  @IsOptional()
  horseDob: string;

  @ApiProperty()
  @IsOptional()
  horseCob: string;

  @ApiProperty()
  @IsOptional()
  horseColour: string;

  @ApiProperty()
  @IsOptional()
  sireId: string;

  @ApiProperty()
  @IsOptional()
  sireName: string;

  @ApiProperty()
  @IsOptional()
  sireYob: string;

  @ApiProperty()
  @IsOptional()
  sireCob: string;

  @ApiProperty()
  @IsOptional()
  sireColour: string;

  @ApiProperty()
  @IsOptional()
  sireSireId: string;

  @ApiProperty()
  @IsOptional()
  sireSireName: string;

  @ApiProperty()
  @IsOptional()
  sireSireYob: string;

  @ApiProperty()
  @IsOptional()
  sireSireCob: string;

  @ApiProperty()
  @IsOptional()
  sireSireColour: string;

  @ApiProperty()
  @IsOptional()
  damId: string;

  @ApiProperty()
  @IsOptional()
  damName: string;

  @ApiProperty()
  @IsOptional()
  damYob: string;

  @ApiProperty()
  @IsOptional()
  damCob: string;

  @ApiProperty()
  @IsOptional()
  damColour: string;

  @ApiProperty()
  @IsOptional()
  damSireId: string;

  @ApiProperty()
  @IsOptional()
  damSireName: string;

  @ApiProperty()
  @IsOptional()
  damSireYob: string;

  @ApiProperty()
  @IsOptional()
  damSireCob: string;

  @ApiProperty()
  @IsOptional()
  damSireColour: string;

  @ApiProperty()
  @IsOptional()
  lotType: number;

  @ApiProperty()
  @IsOptional()
  isNamed: boolean;

  verifiedBy: number;
  verifiedOn: Date;
}
