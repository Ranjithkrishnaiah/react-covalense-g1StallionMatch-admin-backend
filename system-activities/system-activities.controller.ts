import {
  Controller,
  Get,
  Query,
  SetMetadata,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { RoleGuard } from 'src/role/role.gaurd';
import { PageDto } from 'src/utils/dtos/page.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { SystemActivity } from './entities/system-activity.entity';
import { SystemActivitiesService } from './system-activities.service';

@ApiBearerAuth()
@ApiTags('System Activities')
@Controller({
  path: 'system-activities',
  version: '1',
})
export class SystemActivitiesController {
  constructor(
    private readonly systemActivitiesService: SystemActivitiesService,
  ) {}


  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Activity List',
  })
  @ApiOkResponse({
    description: '',
  })
 
  @SetMetadata('api', {
    permissions: ['SYSTEM_ACTIVITIES_SEARCH_VIEW_READONLY'],
  })
  @UseGuards(JwtAuthenticationGuard, RoleGuard)
  @Get()
  findAll(
    @Query() searchOptionsDto: SearchOptionsDto,
  ): Promise<PageDto<SystemActivity>> {
    return this.systemActivitiesService.findAll(searchOptionsDto);
  }

}
