import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Request,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileUploadUrlDto } from 'src/file-uploads/dto/file-upload-url.dto';
import { UpdateMemberProfileImageDto } from 'src/member-profile-image/dto/update-member-profile-image.dto';
import { MembersService } from 'src/members/members.service';
import { RoleGuard } from 'src/role/role.gaurd';
import { AuthService } from './auth.service';
import { AuthChangePasswordDto } from './dto/auth-change-password.dto';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import JwtAuthenticationGuard from './guards/jwt-authentication.guard';

@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    public service: AuthService,
    public memberService: MembersService,
  ) {}

  @ApiOperation({
    summary: 'Login',
  })
  @Post('email/login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() loginDto: AuthEmailLoginDto) {
    return this.service.validateLogin(loginDto);
  }

  @ApiOperation({
    summary: 'Forgot Password',
  })
  @Post('forgot/password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: AuthForgotPasswordDto) {
    return this.service.forgotPassword(forgotPasswordDto.email);
  }

  @ApiOperation({
    summary: 'Refresh Token',
  })
  @ApiBearerAuth()
  @Post('refresh')
  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() request, @Body() token: RefreshTokenDto) {
    return await this.service.refreshTokens(token);
  }

  @ApiOperation({
    summary: 'Logout',
  })
  @ApiBearerAuth()
  @Get('logout')
  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  async logOut(@Request() request) {
    await this.memberService.removeRefreshToken(request.user.email);
    request.res.setHeader('Authorization', null);
  }

  @ApiOperation({
    summary: 'Get User Data',
  })
  @ApiBearerAuth()
  @Get('me')
  @UseGuards(JwtAuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  public async me(@Request() request) {
    return this.service.me(request.user);
  }

  @ApiOperation({
    summary: 'Update User Data',
  })
  @ApiBearerAuth()
  @Patch('me')
  @SetMetadata('api', {
    permissions: ['ADMIN_MEMBER_PROFILE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  public async update(@Request() request, @Body() memberDto: AuthUpdateDto) {
    return this.service.update(request.user, memberDto);
  }

  @ApiOperation({
    summary: 'Update Own Password - Admin Portal Users',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['ADMIN_MEMBER_PROFILE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('me/update-password')
  @HttpCode(HttpStatus.OK)
  public async updatePassword(
    @Request() request,
    @Body() memberDto: AuthChangePasswordDto,
  ) {
    return this.service.updatePassword(request.user, memberDto);
  }

  @ApiOperation({
    summary: 'Resend Email Confirmation ',
  })
  @ApiOkResponse({
    description: 'Verification link has been sent successfully',
  })
  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MEMBER_ADMIN_RESEND_VERIFICATION_EMAIL'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post('email/resend-confirm-email:id')
  @HttpCode(HttpStatus.OK)
  public async resendConfirmEmail(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.service.resendConfirmEmail(id);
  }

  @ApiOperation({
    summary: 'Upload Profile Image - PresignedUrl Generator',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post('me/profile-image')
  async profileImageUpload(@Body() data: FileUploadUrlDto) {
    return await this.memberService.profileImageUpload(data);
  }

  @ApiOperation({
    summary: 'Update Profile Image',
  })
  @ApiOkResponse({
    description: 'Successfully initiated upload profile image',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Patch('me/profile-image')
  profileImages(@Body() updateDto: UpdateMemberProfileImageDto) {
    return this.memberService.profileImageUpdate(updateDto);
  }
}
