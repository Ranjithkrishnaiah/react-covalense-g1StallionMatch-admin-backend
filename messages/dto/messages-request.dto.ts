import { ApiProperty} from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class MessageRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  channelId: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  message: string;

  nominationRequestId: number | null;
  yob: number | null;
  cob: number | null;
  email: string | null;
  fullName: string | null;
  isActive: boolean | null;
  farmId: number | null;
  stallionId: number | null;
  fromMemberId: number | null;
}
