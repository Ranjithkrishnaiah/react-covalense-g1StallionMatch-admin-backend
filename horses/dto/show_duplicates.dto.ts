import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { Condition } from '../condition.enum';
import { Gender } from '../gender.enum';

export class HorseDupSearchDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: Condition })
  @IsEnum(Condition)
  @IsOptional()
  readonly horseNameCondition?: Condition;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly horseName?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  readonly sex?: Gender;

  @ApiPropertyOptional({ enum: Condition })
  @IsEnum(Condition)
  @IsOptional()
  readonly countryCondition?: Condition;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly countryId: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  readonly yob?: number;

  @ApiPropertyOptional({ enum: Condition })
  @IsEnum(Condition)
  @IsOptional()
  readonly sireCondition?: Condition;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly sire?: string;

  @ApiPropertyOptional({ enum: Condition })
  @IsEnum(Condition)
  @IsOptional()
  readonly damCondition?: Condition;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly dam?: string;
}
