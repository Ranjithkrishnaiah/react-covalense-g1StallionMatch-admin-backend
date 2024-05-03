import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReportProductItemsService } from './report-product-items.service';
import { CreateReportProductItemDto } from './dto/create-report-product-item.dto';
import { UpdateReportProductItemDto } from './dto/update-report-product-item.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Report Product Items')
@Controller({
  path: 'report-product-items',
  version: '1',
})
@Controller('report-product-items')
export class ReportProductItemsController {
  constructor(private readonly reportProductItemsService: ReportProductItemsService) {}

  // @Post()
  // create(@Body() createReportProductItemDto: CreateReportProductItemDto) {
  //   return this.reportProductItemsService.create(createReportProductItemDto);
  // }

  // @Get()
  // findAll() {
  //   return this.reportProductItemsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.reportProductItemsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateReportProductItemDto: UpdateReportProductItemDto) {
  //   return this.reportProductItemsService.update(+id, updateReportProductItemDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.reportProductItemsService.remove(+id);
  // }
}
