import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class AdminUpdateDto {
  @ApiProperty({ example: 'Matthew Ennis' })
  @IsOptional()
  @IsNotEmpty()
  fullName?: string;

  @ApiProperty({ example: 'matthew.ennis@yopmail.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  statusId?: number;

  @ApiProperty({ example: 7 })
  @IsOptional()
  @IsNumber()
  countryId?: number;

  @ApiProperty({ example: '600 Freeport Lane, Oxnard, CA 93035' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  sso?: boolean;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  socialLinkId?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  paymentMethodId?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  accessLevel?: number;

  @ApiProperty({ example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  preferenceCenter?: Array<Number>;

  @ApiProperty({
    example: [
      { stallionId: '793DD84A-8641-4350-ACD3-FFD7E77F1327' },
      { stallionId: '0DD1BE34-73F7-EC11-B1E8-00155D01EE2B' },
    ],
  })
  @IsOptional()
  stallions?: ArrayBuffer;

  @ApiProperty({
    example: [
      { horseId: '793DD84A-8641-4350-ACD3-FFD7E77F1327' },
      { horseId: '0DD1BE34-73F7-EC11-B1E8-00155D01EE2B' },
    ],
  })
  @IsOptional()
  myMares?: ArrayBuffer;

  @ApiProperty({
    example: [
      { horseId: '793DD84A-8641-4350-ACD3-FFD7E77F1327' },
      { horseId: '0DD1BE34-73F7-EC11-B1E8-00155D01EE2B' },
    ],
  })
  @IsOptional()
  broodmareSires?: ArrayBuffer;

  @ApiProperty({
    example: [
      { farmId: '793DD84A-8641-4350-ACD3-FFD7E77F1327' },
      { farmId: '0DD1BE34-73F7-EC11-B1E8-00155D01EE2B' },
    ],
  })
  @IsOptional()
  myfarms?: ArrayBuffer;

  @ApiProperty({
    example: [
      { farmId: '793DD84A-8641-4350-ACD3-FFD7E77F1327' },
      { farmId: '0DD1BE34-73F7-EC11-B1E8-00155D01EE2B' },
    ],
  })
  @IsOptional()
  linkedFarms?: ArrayBuffer;

  modifiedBy?: number | null;
}
