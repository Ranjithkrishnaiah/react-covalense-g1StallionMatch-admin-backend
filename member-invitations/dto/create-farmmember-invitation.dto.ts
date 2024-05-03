import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsUUID,
} from 'class-validator';

export class CreateFarmMemberInvitationDto {
  @ApiProperty({ example: 'John Smith' })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'john.smith@yopmail.com' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0b1bb614-c501-4753-a354-0731771b13ba' })
  @IsUUID()
  farmId: string;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsNumber()
  accessLevelId: number;

  @ApiProperty({
    example: [{ stallionId: 'B6DABE34-73F7-EC11-B1E8-00155D01EE2B' }],
  })
  @IsArray()
  stallionIds: Array<{ stallionId: 'B6DABE34-73F7-EC11-B1E8-00155D01EE2B' }>;
  /* Stallions list will be added when user access level is 3rd party*/
  hash?: string | null;
}
