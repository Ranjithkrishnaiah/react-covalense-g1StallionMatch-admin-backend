import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsBoolean } from 'class-validator';

export class CreateChannelDto {
  @ApiProperty()
  @IsNumber()
  txId: number;

  @ApiProperty()
  @IsNumber()
  rxId: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  isActive: boolean;

  channelUuid: string | null;
  txEmail: string | null;
}
