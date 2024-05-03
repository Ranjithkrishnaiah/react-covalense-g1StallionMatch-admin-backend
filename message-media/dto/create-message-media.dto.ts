import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { MessageRequestDto } from 'src/messages/dto/messages-request.dto';
import { MessageMediaDto } from './message-media.dto';

export class CreateMessageMediaDto extends MessageRequestDto {
  @ApiProperty({ type: [MessageMediaDto] })
  @IsOptional()
  @Type(() => MessageMediaDto)
  medias: MessageMediaDto[];
}
