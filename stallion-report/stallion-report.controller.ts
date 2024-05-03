import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { StallionsService } from 'src/stallions/stallions.service';
import { ProgenyTrackerPageOptionsDto } from 'src/stallions/dto/progeny-tracker-page-options.dto';
import { RoleEnum } from 'src/member-roles/roles.enum';
import { Roles } from 'src/member-roles/roles.decorator';
import { RolesGuard } from 'src/member-roles/roles.guard';

@ApiTags('Stallion Report')
@Controller({
  path: 'stallion-report',
  version: '1',
})
export class StallionReportController {
  constructor(private readonly stallionsService: StallionsService) {}
  @ApiOperation({
    summary: 'Get Progeny Tracker of a Stallion',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Get('progeny-tracker')
  getStallionProgenyTracker(
    @Query() searchOptionsDto: ProgenyTrackerPageOptionsDto,
  ) {
    return this.stallionsService.getStallionProgenyTracker(searchOptionsDto);
  }
}
