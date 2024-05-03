import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import {
  NominationStatus,
  MessagesStatus,
  Origin,
  MessagesSortBy,
} from 'src/utils/constants/messaging';
export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  fromOrToName: string;

  @ApiPropertyOptional()
  @IsOptional()
  fromEmail: string;

  @ApiPropertyOptional()
  @IsOptional()
  toEmail: string;

  @ApiPropertyOptional()
  @IsOptional()
  stallionId: string;

  @ApiPropertyOptional()
  @IsOptional()
  farmId: string;

  @ApiPropertyOptional()
  @IsOptional()
  mareName: string;

  @ApiPropertyOptional()
  @IsOptional()
  sentDate: string;

  @ApiPropertyOptional({ enum: MessagesStatus })
  @IsEnum(MessagesStatus)
  @IsOptional()
  readonly messageStatus?: MessagesStatus;

  @ApiPropertyOptional({ enum: NominationStatus })
  @IsEnum(NominationStatus)
  @IsOptional()
  readonly nominationStatus?: NominationStatus;

  @ApiPropertyOptional({ enum: Origin })
  @IsEnum(Origin)
  @IsOptional()
  readonly origin?: Origin;

  @ApiPropertyOptional({ example: '10-100' })
  @IsOptional()
  nominationRange: string;

  @ApiPropertyOptional()
  @IsOptional()
  channelId: string;

  @ApiPropertyOptional({
    enum: MessagesSortBy,
    default: MessagesSortBy.CREATEDDATE,
  })
  @IsEnum(MessagesSortBy)
  @IsOptional()
  readonly sortBy?: MessagesSortBy = MessagesSortBy.CREATEDDATE;

  @ApiPropertyOptional()
  @IsOptional()
  isFlagged: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  isRedirect: boolean;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  readonly limit?: number = 20;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
