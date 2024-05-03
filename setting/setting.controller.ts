import {
  Body,
  Controller,
  Get,
  Post,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RoleGuard } from 'src/role/role.gaurd';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingService } from './setting.service';

@ApiTags('SM Setting')
@Controller({
  path: 'sm-setting',
  version: '1',
})
@ApiBearerAuth()
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @SetMetadata('api', {
    permissions: ['STALLION_MATCH_ADMIN_MANAGE_ADMIN_SETTINGS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  async update(@Body() updateDto: UpdateSettingDto) {
    return await this.settingService.update(updateDto);
  }

  @SetMetadata('api', {
    permissions: ['STALLION_MATCH_ADMIN_MANAGE_ADMIN_SETTINGS'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  async get() {
    return await this.settingService.getData();
  }
}
