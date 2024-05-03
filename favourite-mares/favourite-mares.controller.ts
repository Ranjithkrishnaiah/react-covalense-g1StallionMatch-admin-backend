import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FavouriteMareService } from './favourite-mares.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/member-roles/roles.guard';

@ApiTags('Favourite Mares')
@Controller({
  path: 'favourite-mares',
  version: '1',
})
export class FavouriteMaresController {
  constructor(private readonly favouriteMaresService: FavouriteMareService) {}

  @ApiOperation({
    summary: 'Get All Favourite Mares',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get(':id')
  findAll(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.favouriteMaresService.findAll(id);
  }
}
