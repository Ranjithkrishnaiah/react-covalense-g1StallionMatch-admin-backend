import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { createReadStream } from 'fs';
import { diskStorage } from 'multer';
import JwtAuthenticationGuard from 'src/auth/guards/jwt-authentication.guard';
import { csvFileFilter, csvFileName } from 'src/utils/file-uploading.utils';
import { UpdateLotSettingsDto } from './dto/save-setting.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UpdateLotDto } from './dto/update-lot.dto';
import { SalesLotsService } from './sales-lots.service';

@ApiBearerAuth()
@ApiTags('Sales-Lots')
@Controller({
  path: 'sales-lots',
  version: '1',
})
export class SalesLotsController {
  constructor(private readonly salesLotsService: SalesLotsService) {}

  @ApiOperation({
    summary: 'Get All Sales-Lots',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('')
  findAll(@Query() pageOptionsDto: SearchOptionsDto): Promise<any> {
    return this.salesLotsService.findDetails(pageOptionsDto);
  }

  @ApiOperation({
    summary: 'Download Template',
  })
  @ApiOkResponse({
    description: 'Download Template',
  })
  @Get('list/template')
  async getTemplateFile(@Res() res) {
    const template = 'lot-template.csv';
    res.setHeader('Content-type', 'text/csv');
    res.setHeader('Content-disposition', 'attachment; filename=' + template);
    const filestream = createReadStream('files/lot-list/' + template);
    filestream.pipe(res);
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({
    summary: 'Upload CSV file and inserting list records into database',
  })
  @ApiOkResponse({
    description: 'File uploaded successfully!',
  })
  @Post(':saleId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'src/uploads/sales-lot',
        filename: csvFileName,
      }),
      fileFilter: csvFileFilter,
    }),
  )
  async uploadfile(
    @Param('saleId', new ParseUUIDPipe()) saleId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.salesLotsService.uploadFile(saleId, file);
  }

  @ApiOperation({
    summary: 'Get Lot details',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.salesLotsService.findLotDetails(id);
  }
  @ApiOperation({
    summary: 'Verify Lot',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() data: UpdateLotDto,
  ) {
    return this.salesLotsService.update(id, data);
  }

  @ApiOperation({
    summary: 'Download Sales-Lots ',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('download-sales-lot/:id')
  download(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.salesLotsService.download(id);
  }

  @ApiOperation({
    summary: 'Search Horse By Id ',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('horse-details/:id')
  find(@Param('id', new ParseUUIDPipe()) id: string): Promise<any> {
    return this.salesLotsService.findHorse(id);
  }
  @ApiOperation({
    summary: 'Get Lot Drop-down list',
  })
  @ApiOkResponse({
    description: '',
  })
  @Get('lot-list/:saleId')
  findLots(@Param('saleId', new ParseUUIDPipe()) saleId: string): Promise<any> {
    return this.salesLotsService.findLotList(saleId);
  }

  @ApiOperation({
    summary: 'Generate report pop-up',
  })
  @ApiOkResponse({
    description: '',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @Post('report-settings/:saleId')
  create(
    @Param('saleId', new ParseUUIDPipe()) saleId: string,
    @Body() createDto: UpdateLotSettingsDto,
  ) {
    return this.salesLotsService.create(saleId, createDto);
  }
  
  @ApiBearerAuth()
  @UseGuards(JwtAuthenticationGuard)
  @ApiOperation({
    summary: 'Get All Sales Lot List By Selected Sales',
  })
  @ApiOkResponse({
    description: 'Get All Sales Lot List By Selected Sales',
  })
  @Get('sales-list/by-sales/:sales')
  findBySales(@Param('sales') sales: string) {
    return this.salesLotsService.findBySales(sales);
  }
}
