import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class UpdateFarmDto {
  @ApiProperty({ example: "Matthew's Farm" })
  @IsNotEmpty()
  @Matches(RegExp("^[A-Za-z0-9 $-_.+!*'()&]+$"),{message: "Invalid special characters are not allowed and following are only allowed $-_.+!*'()&"})
  farmName: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  countryId: number;

  @ApiProperty({ example: 99 })
  @IsOptional()
  stateId: number;

  @ApiProperty({ example: 'farm@matthew-farm.com' })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'www.matthews-farm.com' })
  @IsOptional()
  website: string;

  @ApiProperty({ example: '098d69cd-6a95-479e-8444-36c37bfd30e3' })
  @IsOptional()
  @IsUUID()
  profileImageuuid: string; //If Profile image not uploaded this will be empty

  @ApiProperty()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isProfileImageDeleted: boolean;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  modifiedBy?: number | null;
}
