import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { CategoriesService } from './categories.service';

@ApiBearerAuth()
@UseGuards(JwtAuthenticationGuard)
@ApiTags('Categories')
@Controller({
  path: 'categories',
  version: '1',
})
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @ApiOperation({
    summary: 'Get All Categories',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }
}
