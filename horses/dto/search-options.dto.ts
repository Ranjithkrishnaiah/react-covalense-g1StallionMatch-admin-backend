import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { ToBoolean } from 'src/utils/to-boolean';
import { Gelding } from '../gelding.enum';
import { Gender } from '../gender.enum';
import { Eligibility } from '../eligibility.enum';
import { StakesStatus } from '../stakes-status.enum';
import { RunnerStatus } from '../runner-status.enum';
import { SireStatus } from '../sire-status.enum';
import { DamStatus } from '../dam-status.enum';
import { AccuracyProfile } from '../accuracy-profile.enum';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly horseName?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isHorseNameExactSearch?: boolean;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly countryId?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly stateId?: number;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly yob?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  readonly sex?: Gender;

  @ApiPropertyOptional({ enum: Gelding })
  @IsEnum(Gelding)
  @IsOptional()
  readonly gelding?: Gelding;

  @ApiPropertyOptional({ enum: Eligibility })
  @IsEnum(Eligibility)
  @IsOptional()
  readonly eligibility?: Eligibility;

  @ApiPropertyOptional({ enum: StakesStatus })
  @IsEnum(StakesStatus)
  @IsOptional()
  readonly stakesStatus?: StakesStatus;

  @ApiPropertyOptional({ enum: RunnerStatus })
  @IsEnum(RunnerStatus)
  @IsOptional()
  readonly runnerStatus?: RunnerStatus;

  @ApiPropertyOptional({ enum: SireStatus })
  @IsEnum(SireStatus)
  @IsOptional()
  readonly sireStatus?: SireStatus;

  @ApiPropertyOptional({ enum: DamStatus })
  @IsEnum(DamStatus)
  @IsOptional()
  readonly damStatus?: DamStatus;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly horseType?: number;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsUUID()
  @IsOptional()
  readonly sireId?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsUUID()
  @IsOptional()
  readonly damId?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly missingYob?: boolean;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly missingCob?: boolean;

  @ApiPropertyOptional({ enum: AccuracyProfile })
  @IsEnum(AccuracyProfile)
  @IsOptional()
  readonly accuracyProfile?: AccuracyProfile;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly unVerified?: boolean;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly createdDate?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  readonly createdBy?: number;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly sortBy?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly sireName?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isSireNameExactSearch?: boolean;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly damName?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isDamNameExactSearch?: boolean;
}
