import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { ToBoolean } from 'src/utils/to-boolean';

export class SearchOptionsDto extends PageOptionsDto {
 
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly sortBy?: string;
  
  @ApiPropertyOptional({ example: 'Test Sales' })
  @IsString()
  @IsOptional()
  salesName: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isSalesNameExactSearch?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  countryId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  salesCompanyId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  salesInfoId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  salesStatus: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dateRange: string;


}
