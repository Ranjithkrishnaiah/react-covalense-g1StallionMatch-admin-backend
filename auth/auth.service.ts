import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { plainToClass } from 'class-transformer';
import * as crypto from 'crypto';
import { TokenExpiredError } from 'jsonwebtoken';
import { ForgotService } from 'src/forgot/forgot.service';
import { MailService } from 'src/mail/mail.service';
import { RoleEnum } from 'src/member-roles/roles.enum';
import { MembersService } from 'src/members/members.service';
import { MessageRecipient } from 'src/message-recepient/entities/message-recipient.entity';
import { RoleService } from 'src/role/role.service';
import { Status } from 'src/statuses/entities/status.entity';
import { StatusEnum } from 'src/statuses/statuses.enum';
import { In, UpdateResult, getRepository } from 'typeorm';
import { Member } from '../members/entities/member.entity';
import { AuthProvidersEnum } from './auth-providers.enum';
import { AuthChangePasswordDto } from './dto/auth-change-password.dto';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './interface/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private membersService: MembersService,
    private forgotService: ForgotService,
    private mailService: MailService,
    private roleService: RoleService,
  ) {}

  /* Login */
  async validateLogin(
    loginDto: AuthEmailLoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; member: {} }> {
    const member = await this.membersService.findOne({
      email: loginDto.email,
      isArchived: false,
      isActive: true,
    });

    if (
      !member ||
      (member &&
        ![
          RoleEnum.superadmin,
          RoleEnum.admin,
          RoleEnum.developer,
          RoleEnum.marketing,
          RoleEnum.dataaudit,
          RoleEnum.custom,
        ].includes(member.roleId))
    ) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'notFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (member.provider !== AuthProvidersEnum.email) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: `needLoginViaProvider:${member.provider}`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      member.password,
    );

    if (isValidPassword) {
      await this.membersService.updateLastActive(member.id);
      let role = await this.roleService.findOneByRoleId(member.roleId);
      const tokenData = await this.getNewAccessAndRefreshToken({
        id: member.id,
        roleId: member.roleId,
        email: member.email,
      });
      let memberData = {
        ...member,
        roleName: role.RoleName,
      };

      return { ...tokenData, member: memberData };
    } else {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            password: 'incorrectPassword',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  /* Confirm Email */
  async confirmEmail(hash: string): Promise<void> {
    const member = await this.membersService.findOne({
      hash,
      roleId: In([
        RoleEnum.superadmin,
        RoleEnum.admin,
        RoleEnum.developer,
        RoleEnum.marketing,
        RoleEnum.dataaudit,
        RoleEnum.custom,
      ]),
    });

    if (!member) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `notFound`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    member.hash = null;
    member.status = plainToClass(Status, {
      id: StatusEnum.active,
    });
    await member.save();
  }

  /* Resend Confirm Email */
  async resendConfirmEmail(id: string) {
    const record = await this.membersService.findOne({
      memberuuid: id,
    });
    if (!record) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `notFound`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');
    record.hash = hash;
    delete record.memberprofileimages;
    await record.save();
    await this.mailService.memberSignUp({
      to: record.email,
      data: {
        hash,
        fullName: record.fullName,
      },
    });
    return { message: 'Verification link has been sent successfully' };
  }

  /* Forgot Password */
  async forgotPassword(email: string) {
    const member = await this.membersService.findOne({
      email,
      roleId: RoleEnum.Breeder,
    });
    if (!member) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'Email Not Exist!',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    } else {
      const hash = crypto
        .createHash('sha256')
        .update(randomStringGenerator())
        .digest('hex');
      const created = await this.forgotService.create({
        hash,
        member,
      });
      this.mailService.forgotPassword({
        to: email,
        data: {
          hash,
          fullName: member.fullName,
        },
      });
      return { message: 'Forgot Password link has been sent successfully' };
    }
  }

  /* Reset Password */
  async resetPassword(hash: string, password: string): Promise<void> {
    const forgot = await this.forgotService.findOne({
      where: {
        hash,
      },
    });

    if (!forgot) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: `notFound`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const member = forgot.member;
    member.password = password;
    await member.save();
    await this.forgotService.softDelete(forgot.id);
  }

  /* Get User Data */
  async me(member: Member): Promise<Member> {
    return this.membersService.findOne({
      id: member.id,
      roleId: In([
        RoleEnum.superadmin,
        RoleEnum.admin,
        RoleEnum.developer,
        RoleEnum.marketing,
        RoleEnum.dataaudit,
        RoleEnum.custom,
      ]),
    });
  }

  /* Update user data */
  async update(member: Member, memberDto: AuthUpdateDto): Promise<Member> {
    if (memberDto.profileImageuuid) {
      await this.membersService.setProfileImages(
        member,
        memberDto.profileImageuuid,
      );
    }
    // const oldData = await this.membersService.findOne({
    //   id: member.id,
    // });
    // if (oldData.email != memberDto.email) {
    //   var updateResult: UpdateResult = await getRepository(
    //     MessageRecipient,
    //   ).update(
    //     { recipientEmail: oldData.email },
    //     { recipientEmail: memberDto.email },
    //   );
    // }
    await this.membersService.update(member, memberDto);

    return this.membersService.findOne({
      id: member.id,
    });
  }

  /* Delete a user */
  async softDelete(member: Member): Promise<void> {
    await this.membersService.softDelete(member.id);
  }

  /* Get User Data By Refresh token */
  async getUserIfRefreshTokenMatches(refreshToken: string) {
    try {
      const decoded = this.jwtService.decode(refreshToken) as JwtPayload;
      if (!decoded) {
        throw new Error();
      }
      const user = await this.membersService.getUserByEmail(decoded.email);
      const isRefreshTokenMatching = await bcrypt.compare(
        refreshToken,
        user.hashedRefreshToken,
      );
      if (isRefreshTokenMatching) {
        await this.membersService.removeRefreshToken(user.email);
        return user;
      } else {
        throw new UnauthorizedException();
      }
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      } else {
        throw new UnprocessableEntityException('Refresh token malformed');
      }
    }
  }

  /* Get Access Token */
  async getAccessToken(payload: JwtPayload) {
    const accessToken = await this.jwtService.sign(payload, {
      secret: this.configService.get('auth.secret'),
      expiresIn: this.configService.get('auth.expires'),
    });
    return accessToken;
  }

  /* Get Refresh Token */
  async getRefreshToken(payload: JwtPayload) {
    const refreshToken = await this.jwtService.sign(payload, {
      secret: this.configService.get('auth.refreshTokenSecret'),
      expiresIn: this.configService.get('auth.refreshTokenExpires'),
    });
    return refreshToken;
  }

  /* Get New Access And Refresh Token */
  async getNewAccessAndRefreshToken(payload: JwtPayload) {
    const refreshToken = await this.getRefreshToken(payload);
    await this.membersService.setCurrentRefreshToken(payload.id, refreshToken);

    return {
      accessToken: await this.getAccessToken(payload),
      refreshToken: refreshToken,
    };
  }

  /* Get New Access And Refresh Token */
  async refreshTokens(token: RefreshTokenDto) {
    const user = await this.getUserIfRefreshTokenMatches(token.refresh_token);
    if (user) {
      const userInfo = {
        id: user.id,
        roleId: user.roleId,
        email: user.email,
      };
      return this.getNewAccessAndRefreshToken(userInfo);
    } else {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `notFound`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /* Update Password */
  async updatePassword(member: Member, memberDto: AuthChangePasswordDto) {
    if (member.roleId < RoleEnum.superadmin) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          errors: 'You are not allowed to change password.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.membersService.updatePassword(member, memberDto);
  }
}
