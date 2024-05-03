import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FavouriteBroodmareSireService } from './favourite-broodmare-sires.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { FavouriteBroodmareSire } from './entities/favourite-broodmare-sire.entity';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { TrackedDamSireNameSearchDto } from './dto/tracked-damsire-search.dto';

@ApiTags('Favourite Broodmare Sires')
@Controller({
  path: 'favourite-broodmare-sires',
  version: '1',
})
export class FavouriteBroodmareSiresController {
  constructor(
    private readonly favouriteBroodmareSireService: FavouriteBroodmareSireService,
  ) {}

  @ApiOperation({
    summary: 'Get All Favourite Dam-Sire By Name',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('tracked')
  getTrackedStallionByName(
    @Query() searchOptionsDto: TrackedDamSireNameSearchDto,
  ) {
    return this.favouriteBroodmareSireService.getTrackedStallionByName(
      searchOptionsDto,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all Favourite Brood-Mare sire',
  })
  @ApiPaginatedResponse(FavouriteBroodmareSire)
  @UseGuards(JwtAuthenticationGuard)
  @Get(':id')
  findAll(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.favouriteBroodmareSireService.findAll(id);
  }
}
