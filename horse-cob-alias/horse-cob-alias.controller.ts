import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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
  UseGuards,
} from '@nestjs/common';
import { HorseCobAliasService } from './horse-cob-alias.service';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { CreateCobAliasDto } from './dto/create-cob-alias.dto';
import { UpdateCobVisibilityDto } from './dto/change-cob-visibility.dto';
import { HorseCobAliasResponse } from './dto/get-alias-response.dto';
import { PageDto } from 'src/utils/dtos/page.dto';
import { PageOptionsDto } from 'src/utils/dtos/page-options.dto';

@ApiBearerAuth()
@ApiTags('HorseCob Alias')
@Controller({
  path: 'horse-cob-alias',
  version: '1',
})
export class HorseCobAliasController {
  constructor(private readonly horseCobAliasService: HorseCobAliasService) {}
  @ApiOperation({
    summary: 'Get Alias countries of Horse by horseId',
  })
  @ApiOkResponse({
    description: '',
    type: HorseCobAliasResponse,
    isArray: true,
  })
  @Get(':horseId')
  find(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<HorseCobAliasResponse>> {
    return this.horseCobAliasService.getAliasCountries(horseId, pageOptionsDto);
  }
  @Get('horse-cob-default-alias/:horseId')
  findDefault(@Param('horseId', new ParseUUIDPipe()) horseId: string) {
    return this.horseCobAliasService.findDefault(horseId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add Alias Countries for Horse ',
  })
  @ApiCreatedResponse({
    description: 'Record Created successfully!',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Post()
  create(@Body() data: CreateCobAliasDto) {
    return this.horseCobAliasService.create(data);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Default Cob for Horse ',
  })
  @ApiOkResponse({
    description: 'Record Updated successfully!',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Patch(':horseId/:countryId')
  update(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Param('countryId') countryId: number,
  ) {
    return this.horseCobAliasService.updateDefault(horseId, countryId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update Visibily of Alias Name for Horse ',
  })
  @ApiOkResponse({
    description: 'Record Updated successfully!',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Patch('change-visibility/:horseId/:countryId')
  updateVisibility(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Param('countryId') countryId: number,
    @Body() updateVisibilityDto: UpdateCobVisibilityDto,
  ) {
    return this.horseCobAliasService.updateVisibility(
      horseId,
      countryId,
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
  @UseGuards(JwtAuthenticationGuard)
  @Delete(':horseId/:countryId')
  delete(
    @Param('horseId', new ParseUUIDPipe()) horseId: string,
    @Param('countryId') countryId: number,
  ) {
    return this.horseCobAliasService.delete(horseId, countryId);
  }
}
