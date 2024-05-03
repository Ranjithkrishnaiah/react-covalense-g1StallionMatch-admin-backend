import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
enum checkReport {
  'studFee report ' = 'studFee report',
  'analytics report' = 'analytics report'
 
  
}

export class shareData {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  stallionId: string;
  
  @ApiProperty()
  @IsString()
  toEmail: string;

  @ApiProperty()
  @IsString()
  toDate: string;

  @ApiProperty()
  @IsString()
  fromDate: string;

  @ApiPropertyOptional({ enum: checkReport })
  @IsEnum(checkReport)
  readonly type?: checkReport;

  @ApiProperty()
  @IsOptional()
  @IsString()
  filterBy: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  comment: string;

}
