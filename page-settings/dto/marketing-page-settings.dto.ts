import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class MarketingPageSettingsDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty({ example: { name: '11', value: 'Australia' } })
  @IsOptional()
  country: object;

  @ApiProperty({ example: { name: '1', value: 'AUD' } })
  @IsOptional()
  officialCurrency: object;

  @ApiProperty({ example: { name: '1', value: 'AUD' } })
  @IsOptional()
  smDisplayCurrency: object;
}
