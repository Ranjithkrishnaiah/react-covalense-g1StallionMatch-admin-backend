import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePricingTileDto {
  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsUUID()
  marketingPageSectionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;
}
