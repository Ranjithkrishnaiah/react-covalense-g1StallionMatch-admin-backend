import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import { RolesGuard } from 'src/member-roles/roles.guard';
import { ApiPaginatedResponse } from 'src/utils/decorators/api-paginated-response.decorator';
import { MemberMare } from './entities/member-mare.entity';
import { MemberMaresService } from './member-mares.service';

@ApiTags('Member Mare')
@Controller({
  path: 'member-mares',
  version: '1',
})
export class MemberMaresController {
  constructor(private readonly memberMaresService: MemberMaresService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Search Member Mare',
  })
  @ApiPaginatedResponse(MemberMare)
  @UseGuards(JwtAuthenticationGuard)
  @Get(':id')
  findAll(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.memberMaresService.findAll(id);
  }

}
