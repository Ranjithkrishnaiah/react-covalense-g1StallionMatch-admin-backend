import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RoleGuard } from 'src/role/role.gaurd';
import { CreateRaceHorseDto } from './dto/create-race-horse.dto';
import { RunnerHorseNameSearchDto } from './dto/runner-horse-name-search.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UpdateRaceHorseUrlDto } from './dto/update-race-horse-url.dto';
import { RaceHorseService } from './race-horse.service';

@ApiBearerAuth()
@ApiTags('Race Horse')
@Controller({
  path: 'race-horse',
  version: '1',
})
export class RaceHorseController {
  constructor(private readonly raceHorseService: RaceHorseService) {}

  @SetMetadata('api', {
    permissions: [
      'MARKETING_RACEHORSE_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @ApiOperation({
    summary: 'Search Runner Horse By Name',
  })
  @Get('search-runner-horse-name')
  async getRunnerHorseByName(
    @Query() searchOptionsDto: RunnerHorseNameSearchDto,
  ) {
    return await this.raceHorseService.findRunnerHorsesByName(
      searchOptionsDto,
    );
  }

  @ApiOperation({
    summary: 'Download',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @SetMetadata('api', {
    permissions: [
      'MARKETING_RACEHORSE_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get('download-csv')
  async downloadAllDataAsCsv(
    @Res() res: Response,
  ) {
    let file = await this.raceHorseService.downloadAllDataAsCsv();
    res.set({
      'Content-Type': 'application/vnd.ms-excel',
      'Content-Disposition': 'attachment; filename="report.xlsx"',
    });
    return res.download(`${file}`);
  }

  @SetMetadata('api', {
    permissions: [
      'MARKETING_RACEHORSE_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @ApiOperation({
    summary: 'Get All Race Horses',
  })
  @Get()
  async findAll(@Query() pageOptionsDto: SearchOptionsDto) {
    return await this.raceHorseService.findAll(pageOptionsDto);
  }

  @ApiBearerAuth()
  @SetMetadata('api', {
    permissions: ['MARKETING_RACEHORSE_PAGE'],
  })
  @ApiOperation({
    summary: 'Create a Race Horse',
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Post()
  async create(@Body() raceHorseDto: CreateRaceHorseDto) {
    return await this.raceHorseService.create(raceHorseDto);
  }

  @SetMetadata('api', {
    permissions: [
      'MARKETING_RACEHORSE_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @ApiOperation({
    summary: 'Activate/Deactivate RaceHorse',
  })
  @Patch(':raceHorseId/activate-deactivate')
  async activateDeactivateRaceHorse(
    @Param('raceHorseId', new ParseUUIDPipe()) raceHorseId: string,
  ) {
    return await this.raceHorseService.activateDeactivateRaceHorse(
      raceHorseId,
    );
  }

  @SetMetadata('api', {
    permissions: [
      'MARKETING_RACEHORSE_PAGE',
    ],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @ApiOperation({
    summary: 'Update Race Horse Url',
  })
  @Patch(':raceHorseId/update-url')
  async updateUrl(
    @Param('raceHorseId', new ParseUUIDPipe()) raceHorseId: string,
    @Body() raceHorseDto: UpdateRaceHorseUrlDto,
  ) {
    return await this.raceHorseService.updateUrl(
      raceHorseId,
      raceHorseDto,
    );
  }
}
