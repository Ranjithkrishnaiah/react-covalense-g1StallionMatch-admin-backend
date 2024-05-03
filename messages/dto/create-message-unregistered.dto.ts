import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional} from 'class-validator';

export class CreateMessageUnregisteredDto {
  @ApiProperty()
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @IsOptional()
  subject: string;

  @ApiProperty()
  @IsOptional()
  fullName: string;

  @ApiProperty()
  @IsOptional()
  email: string;

  @ApiProperty()
  @IsOptional()
  channelId: string;

  nominationRequestId: number | null;
  fromMemberId: string | null;
  msgChannelId: number | null;
  farmId: number | null;
  stallionId: number | null;
  fromName: string | null;
  fromEmail: string | null;
  cob: number | null;
  yob: number | null;
  mareId: number | null;
  mareName: string | null;
}
