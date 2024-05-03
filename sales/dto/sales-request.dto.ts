import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNumber, IsString } from 'class-validator';

export class SalesRequestDto {
  @ApiProperty({ example: 'Test22' })
  @IsString()
  salesCode: string | null;

  @ApiProperty({ example: 'Test Sales' })
  @IsString()
  salesName: string | null;

  @ApiProperty({ example: '2022-03-15' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ example: '2022-03-20' })
  @IsDateString()
  endDate: Date;

  @ApiProperty({ example: 1 })
  @IsNumber()
  countryId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  salesCompanyId: number;

  // @ApiProperty({ example: 2 })
  // @IsNumber()
  // salesInfoId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  salesTypeId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  statusId: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isOnlineSales: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  isHIP: boolean;

  @ApiProperty({ example: 'https://www.lipsum.com/' })
  @IsString()
  salesfileURL: string;

  @ApiProperty({ example: 'https://www.lipsum.com/' })
  @IsString()
  salesfileURLSDX: string;

  createdBy?: number | null;
}
