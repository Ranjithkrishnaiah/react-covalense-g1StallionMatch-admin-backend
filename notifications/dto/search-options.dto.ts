import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationsStatus } from 'src/utils/constants/messaging';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { ToBoolean } from 'src/utils/to-boolean';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly sortBy?: string;
  
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isNameExactSearch?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isEmailAddressExactSearch?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  sentDate: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly title?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly messageKey?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly linkType?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  readonly countryId?: number;

  @ApiPropertyOptional({
    enum: NotificationsStatus,
  //  default: NotificationsStatus.UNREAD,
  })
  @IsEnum(NotificationsStatus)
  @IsOptional()
  readonly status?: NotificationsStatus;
}
