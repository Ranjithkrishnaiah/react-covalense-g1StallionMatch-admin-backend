import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FavouriteStallionsService } from './favourite-stallions.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { TrackedStallionSearchDto } from './dto/tracked-stallion-search.dto';

@ApiTags('Favourite Stallions')
@Controller({
  path: 'favourite-stallions',
  version: '1',
})
export class FavouriteStallionsController {
  constructor(
    private readonly favouriteStallionsService: FavouriteStallionsService,
  ) {}

  @ApiOperation({
    summary: 'Get All Favourite Stallions By Stallion Name',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('tracked')
  getTrackedStallionByName(
    @Query() searchOptionsDto: TrackedStallionSearchDto,
  ) {
    return this.favouriteStallionsService.getTrackedStallionByName(
      searchOptionsDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all Favourite Stallions - For Member',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get(':id')
  findAll(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.favouriteStallionsService.findAll(id);
  }
}
