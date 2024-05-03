import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { format } from 'date-fns';
import { Workbook } from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExcelService {
  constructor(private readonly configService: ConfigService) {}

  //Generate Excel
  async generateReport(reportTitle: string, reportHeaders, reportData) {
    const dir = path.resolve(path.join(process.cwd(), '/files/excel'));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let filePath =
      path.join(process.cwd(), '/files/excel/') + reportTitle + '.xlsx';
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet(reportTitle);
    const columns = [];
    reportHeaders.forEach((data) => {
      columns.push({
        header: data.header,
        key: data.key,
        width: data?.width ? data?.width : 30,
      });
    });
    worksheet.columns = columns;
    reportData.forEach((data) => {
      if (data['Averge response time']) {
        data['Averge response time'] = format(data['Averge response time'], 'HH:mm:ss')
      }
      worksheet.addRow({
        ...data,
      });
    });
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = {
        bold: true,
      };
    });
    let File = await new Promise((resolve, reject) => {
      workbook.xlsx
        .writeFile(filePath)
        .then(function () {
          resolve(filePath);
        })
        .catch((err) => {
          throw new BadRequestException(err);
        });
    });
    return File;
  }
}
