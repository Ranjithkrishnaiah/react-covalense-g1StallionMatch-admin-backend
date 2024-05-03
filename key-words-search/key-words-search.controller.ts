import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { KeyWordsSearchService } from './key-words-search.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { KeyWordsSearchOptionsDto } from './dto/key-words-search-options.dto';
import { Roles } from 'src/member-roles/roles.decorator';
import { RoleEnum } from 'src/member-roles/roles.enum';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RolesGuard } from 'src/member-roles/roles.guard';

@ApiTags('Key Words Search')
@Controller({
  path: 'key-words-search',
  version: '1',
})
export class KeyWordsSearchController {
  constructor(private readonly keyWordsSearchService: KeyWordsSearchService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Key Words Search List',
  })
  @ApiOkResponse({
    description: '',
  })
  @UseGuards(JwtAuthenticationGuard)
  @Get()
  findAll(@Query() searchOptionsDto: KeyWordsSearchOptionsDto) {
    return this.keyWordsSearchService.findAll(searchOptionsDto);
  }
}
