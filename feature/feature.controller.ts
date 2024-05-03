import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/feature.dto';
import { FeatureResponseDto } from './dto/feature-response.dto';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Feature')
@Controller({
  path: 'feature',
  version: '1',
})
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @ApiOperation({ summary: 'Get All Features' })
  @ApiOkResponse({
    description: '',
    type: FeatureResponseDto,
    isArray: true,
  })
  @Get()
  findAll(): Promise<FeatureResponseDto[]> {
    return this.featureService.findAll();
  }

  @ApiOperation({ summary: 'Get Feature - By id' })
  @ApiOkResponse({
    description: '',
    type: FeatureResponseDto,
    isArray: true,
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<FeatureResponseDto[]> {
    return this.featureService.findOne(+id);
  }

  @ApiOperation({ summary: 'Create Feature' })
  @ApiCreatedResponse({ description: 'Feature created successfully.' })
  @Post()
  create(@Body() createFeature: CreateFeatureDto) {
    return this.featureService.create(createFeature);
  }
}
