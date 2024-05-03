import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RoleGuard } from 'src/role/role.gaurd';
import { CreateUserDto } from './dto/create-user.dto';
import { SearchUsersDto } from './dto/search-users';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Admin Users')
@Controller({
  path: 'users',
  version: '1',
})
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({
    summary: 'Get All Users',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['ADMIN_USER_MANAGEMENT_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  async findAll(@Query() searchOptionsDto: SearchUsersDto) {
    return this.usersService.getAllUsers(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get All Users - Download',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: ['ADMIN_USER_MANAGEMENT_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('download')
  async downloadAll(@Res() res: Response) {
    let file = await this.usersService.downloadAll();
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': 'attachment; filename="download.xlsx"',
    });
    return res.download(`${file}`);
  }

  @ApiOperation({
    summary: 'Add A User',
  })
  @ApiOkResponse({
    description: '',
  })
  @SetMetadata('api', {
    permissions: ['ADMIN_USER_MANAGEMENT_CREATE_NEW_USER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  addUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.addUser(createUserDto);
  }

  @ApiOperation({
    summary: 'Get A User',
  })
  @ApiOkResponse({
    description: '',
  })
  @SetMetadata('api', {
    permissions: ['ADMIN_USER_MANAGEMENT_EDIT_EXISTING_USER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get(':userId')
  getUser(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.usersService.getUser(userId);
  }

  @ApiOperation({
    summary: 'Update A User',
  })
  @ApiOkResponse({
    description: '',
  })
  @SetMetadata('api', {
    permissions: ['ADMIN_USER_MANAGEMENT_EDIT_EXISTING_USER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':userId')
  updateUser(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() updateUser: UpdateUserDto,
  ) {
    return this.usersService.updateUser(userId, updateUser);
  }

  @ApiOperation({
    summary: 'Delete A User',
  })
  @ApiOkResponse({
    description: '',
  })
  @SetMetadata('api', {
    permissions: ['ADMIN_USER_MANAGEMENT_EDIT_EXISTING_USER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete(':userId')
  @HttpCode(HttpStatus.ACCEPTED)
  deleteUser(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.usersService.deleteUser(userId);
  }

  @ApiOperation({
    summary: 'Update A User status',
  })
  @ApiOkResponse({
    description: '',
  })
  @SetMetadata('api', {
    permissions: ['ADMIN_USER_MANAGEMENT_EDIT_EXISTING_USER'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('update-status/:userId/:status')
  updateUserStatus(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('status') status: boolean,
  ) {
    return this.usersService.updateActive(userId, status);
  }
}
