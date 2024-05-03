import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ImpactAnalysisTypeService } from './impact-analysis-type.service';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('ImpactAnalysisTypes')
@Controller({
  path: 'impact-analysis-type',
  version: '1',
})
export class ImpactAnalysisTypeController {
  constructor(
    private readonly impactAnalysisTypeService: ImpactAnalysisTypeService,
  ) {}

  @ApiOperation({
    summary: 'Get All Impact Analysis Type Data',
  })
  @Get()
  findAll() {
    return this.impactAnalysisTypeService.findAll();
  }
}
