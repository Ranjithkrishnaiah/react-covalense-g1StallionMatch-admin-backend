import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ToBoolean } from 'src/utils/to-boolean';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { Order } from 'src/utils/constants/order';
import { HorseTracking } from '../horse-tracking.enum';
import { PreferedNotifications } from '../preferred-notification.enum';
import { PrevOrders } from '../previous-orders.enum';
import { farmUser } from '../farm-user.enum';
import { SearchOpt } from '../search-acttivity-share.enum';
import { favOpt } from '../favourite-option.enum';

export class SearchOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ enum: Order, default: Order.ASC })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order = Order.ASC;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsOptional()
  readonly emailAddress?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly isEmailAddressExactSearch?: boolean;

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
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly country?: string;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  readonly paymentmethodId?: Number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  readonly statusId?: Number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  readonly socialLinkId?: Number;

  @ApiPropertyOptional({ enum: farmUser })
  @IsEnum(farmUser)
  @IsOptional()
  readonly farmUser?: farmUser;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  readonly accessLevel?: Number;

  @ApiPropertyOptional({ enum: HorseTracking })
  @IsEnum(HorseTracking)
  @IsOptional()
  readonly horseTracking?: HorseTracking;

  @ApiPropertyOptional({ enum: PreferedNotifications })
  @IsEnum(PreferedNotifications)
  @IsOptional()
  readonly PreferedNotifications?: PreferedNotifications;

  @ApiPropertyOptional({ enum: PrevOrders })
  @IsEnum(PrevOrders)
  @IsOptional()
  readonly PrevOrders?: PrevOrders;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  activePeriod?: string;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  readonly verified?: boolean;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsUUID()
  @IsOptional()
  readonly farmId?: string;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsUUID()
  @IsOptional()
  readonly horseId?: string;

  @ApiPropertyOptional({ enum: SearchOpt })
  @IsEnum(SearchOpt)
  @IsOptional()
  readonly activity?: SearchOpt;

  @ApiPropertyOptional({ enum: favOpt })
  @IsEnum(favOpt)
  @IsOptional()
  readonly favourite?: favOpt;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  readonly socialShare?: Number;

  @ApiPropertyOptional()
  @Type(() => String)
  @IsString()
  @IsOptional()
  readonly sortBy?: string;
}
