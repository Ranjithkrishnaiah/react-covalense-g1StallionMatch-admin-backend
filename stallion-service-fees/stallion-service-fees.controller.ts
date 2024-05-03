import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { pageOptionsDto } from './dto/page-option.dto';
import { studfeeChartDto } from './dto/stud-fee-chart.dto';
import { StallionServiceFeesService } from './stallion-service-fees.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Stallions')
@Controller({
  path: 'stallions-service-fees',
  version: '1',
})
//@Controller('stallion-service-fees')
export class StallionServiceFeesController {
  constructor(
    private readonly stallionServiceFeesService: StallionServiceFeesService,
  ) {}
  @ApiOperation({
    summary: 'Get all stallion stud Fee History',
  })
  @ApiOkResponse({
    description: '',
    isArray: true,
  })
  @Get(':id/stud-fee')
  studFeeChart(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() pageOptionsDto: pageOptionsDto,
  ) {
    return this.stallionServiceFeesService.studFeeHistory(
      id,
      pageOptionsDto,
      1,
    );
  }

  @ApiOperation({
    summary: 'Get all stallion stud Fee Chart',
  })
  @ApiOkResponse({
    description: '',

    isArray: true,
  })
  @Get(':id/stud-fee-chart')
  studFeeHistory(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() searchByDate: studfeeChartDto,
  ) {
    return this.stallionServiceFeesService.studFeeChart(id, searchByDate);
  }
}
