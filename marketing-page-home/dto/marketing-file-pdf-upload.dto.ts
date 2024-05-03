import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class MarketingFilePdfUploadUrlDto {
  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e1' })
  @IsNotEmpty()
  @IsUUID()
  marketingPageSectionUuid: string;

  @ApiProperty({ example: 'abc.pdf' })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsNotEmpty()
  @IsString()
  fileuuid: string;

  @ApiProperty({ example: 1024 })
  @IsNotEmpty()
  @IsNumber()
  fileSize: number;
}
