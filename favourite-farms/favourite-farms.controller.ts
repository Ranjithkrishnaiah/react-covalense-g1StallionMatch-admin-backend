import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FavouriteFarmsService } from './favourite-farms.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { TrackedFarmNameSearchDto } from './dto/tracked-farm-search.dto';

@ApiTags('Favourite Farms')
@Controller({
  path: 'favourite-farms',
  version: '1',
})
export class FavouriteFarmsController {
  constructor(private readonly favouriteFarmsService: FavouriteFarmsService) {}

  @ApiOperation({
    summary: 'Get All Favourite Farms By Farm Name',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('tracked')
  getTrackedFarmByName(@Query() searchOptionsDto: TrackedFarmNameSearchDto) {
    return this.favouriteFarmsService.getTrackedFarmByName(searchOptionsDto);
  }

  @ApiOperation({
    summary: 'Get All Favourite Farms By Member',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get(':id')
  findAll(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.favouriteFarmsService.findAll(id);
  }
}
