import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { MaresListService } from './mares-list.service';
@ApiTags('Mares List')
@Controller({
  path: 'mares-list',
  version: '1',
})
export class MaresListController {
  constructor(private readonly maresListService: MaresListService) {}
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all List',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get(':id')
  findAll(@Param('id') id: number) {
    return this.maresListService.findAll(id);
  }
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all List By Farm Id',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get('byFarmId/:farmId')
  findAllByFarmId(@Param('farmId', new ParseUUIDPipe()) farmId: string) {
    return this.maresListService.findByFarmId(farmId);
  }
}
