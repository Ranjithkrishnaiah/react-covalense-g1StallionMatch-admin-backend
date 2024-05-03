import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { UpdateVisibilityDto } from './dto/change_visibility.dto';
import { HorseNameAliasDto } from './dto/create-alias.dto';
import { HorseNameAliasResponse } from './dto/get-alias-response.dto';
import { HorseNameAliasService } from './horse-name-alias.service';
import { RoleGuard } from 'src/role/role.gaurd';

@ApiBearerAuth()
@ApiTags('HorseName Alias')
@Controller({
  path: 'horse-name-alias',
  version: '1',
})
export class HorseNameAliasController {
  constructor(private readonly horseNameAliasService: HorseNameAliasService) {}

  @ApiOperation({
    summary: 'Get Alias Names of Horse by horseId',
  })
  @ApiOkResponse({
    description: '',
    type: HorseNameAliasResponse,
    isArray: true,
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get(':horseId')
  find(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Object>> {
    return this.horseNameAliasService.getAliasNames(horseId, pageOptionsDto);
  }

  @UseGuards(JwtAuthenticationGuard)
  @Get('horse-name-default-alias/:horseId')
  findDefault(@Param('horseId', new ParseUUIDPipe()) horseId: string) {
    return this.horseNameAliasService.findDefault(horseId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add Alias Names for Horse ',
  })
  @ApiCreatedResponse({
    description: 'Record Created successfully!',
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_ADD_AN_ALIAS_FOR_A_HORSE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  create(@Body() data: HorseNameAliasDto) {
    return this.horseNameAliasService.create(data);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Default Names for Horse',
  })
  @ApiOkResponse({
    description: 'Record Updated successfully!',
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_ADD_AN_ALIAS_FOR_A_HORSE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch(':horseId/:horseName')
  update(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Param('horseName') horseName: string,
  ) {
    return this.horseNameAliasService.updateDefault(horseId, horseName);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Visibily of Alias Name for Horse ',
  })
  @ApiOkResponse({
    description: 'Record Updated successfully!',
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_ADD_AN_ALIAS_FOR_A_HORSE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Patch('change_visibility/:horseId/:horseName')
  updateVisibility(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Param('horseName') horseName: string,
    @Body() updateVisibilityDto: UpdateVisibilityDto,
  ) {
    return this.horseNameAliasService.updateVisibility(
      horseId,
      horseName,
      updateVisibilityDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete Alias Name for Horse ',
  })
  @ApiOkResponse({
    description: 'Record Deleted successfully!',
  })
  @SetMetadata('api', {
    permissions: ['HORSE_ADMIN_DELETE_AN_ALIAS_FOR_A_HORSE'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Delete(':horseId/:horseName')
  delete(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Param('horseName') horseName: string,
  ) {
    return this.horseNameAliasService.delete(horseId, horseName);
  }
}
