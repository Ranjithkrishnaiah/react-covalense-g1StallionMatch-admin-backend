import { Entity } from 'typeorm';
import { Status } from '../../statuses/entities/status.entity';
import { AuthProvidersEnum } from 'src/auth/auth-providers.enum';
import { ApiResponseProperty } from '@nestjs/swagger';

@Entity('tblMember')
export class MemberResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  memberuuid: string;

  @ApiResponseProperty()
  email: string;

  @ApiResponseProperty()
  password: string;

  @ApiResponseProperty()
  fullName: string;

  @ApiResponseProperty()
  isActive: boolean;

  @ApiResponseProperty()
  isVerified: boolean;

  @ApiResponseProperty()
  paymentMethodId: number;

  @ApiResponseProperty()
  statusId: number;

  @ApiResponseProperty()
  sso: boolean;

  @ApiResponseProperty()
  provider: string | AuthProvidersEnum.email;

  @ApiResponseProperty()
  socialId: string | null;

  @ApiResponseProperty()
  socialLinkId: Number;

  @ApiResponseProperty()
  roleId: number;

  @ApiResponseProperty()
  status?: Status;

  @ApiResponseProperty()
  hash: string | null;

  @ApiResponseProperty()
  hashedRefreshToken: string;

  @ApiResponseProperty()
  createdOn: Date;

  @ApiResponseProperty()
  modifiedOn: Date;

  @ApiResponseProperty()
  deletedOn: Date;

  @ApiResponseProperty()
  lastActive: Date;

  @ApiResponseProperty()
  addresses: string;

  @ApiResponseProperty()
  memberprofileimages: string;

  @ApiResponseProperty()
  countryCode: string;

  @ApiResponseProperty()
  countryId: string;
}
