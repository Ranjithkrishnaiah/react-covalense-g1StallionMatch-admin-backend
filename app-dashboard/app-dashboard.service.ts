import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { ExcelService } from 'src/excel/excel.service';
import { GoogleAnalyticsService } from 'src/google-analytics/google-analytics.service';
import { APPDASHBOARDKPI } from 'src/utils/constants/dashboard-kpi';
import { Connection } from 'typeorm';
import { AppDashboardDto } from './dto/app-dashboard.dto';
import { DashboardReportDto } from './dto/dashboard-report.dto';
import { TopVisitedFarmsDto } from './dto/top-visited-farms.dto';

@Injectable()
export class AppDashboardService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly connection: Connection,
    private excelService: ExcelService,
    private readonly gaService: GoogleAnalyticsService,
    private readonly commonUtilsService: CommonUtilsService,
  ) {}

  /* Get Main Dashboard Data */
  async getDashboardData(options: AppDashboardDto) {
    let result = await this.connection.query(
      `EXEC procGetMainLandingDashboard @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let response = [];
    await result.map(async (record: any) => {
      let diffPercent = 0;
      if (record.PrevValue) {
        diffPercent = Math.round((record.Diff / record.PrevValue) * 100);
      } else {
        diffPercent = Math.round(record.Diff / 0.01);
      }
      response.push({
        ...record,
        diffPercent: diffPercent,
      });
    });
    return response;
  }

  /* Get Main Dashboard Report Data */
  async getDashboradReportData(options: DashboardReportDto) {
    let qbQuery = '';
    switch (options.kpiTitle) {
      case APPDASHBOARDKPI.TOTAL_STALLIONS:
        qbQuery = `EXEC procGetMainLandingDashboardTotalStallionsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case APPDASHBOARDKPI.TOTAL_REGISTRATIONS:
        qbQuery = `EXEC procGetMemberDashboardNewRegistrationsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case APPDASHBOARDKPI.TOTAL_REPORTS:
        qbQuery = `EXEC procGetReportsDashboardTotalReportsOrderedDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case APPDASHBOARDKPI.TOP_VISITED_FARMS:
        qbQuery = `EXEC procGetMainLandingDashboardTopVisitedFarmsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
      case APPDASHBOARDKPI.TOTAL_VISITS:
        qbQuery = `EXEC procGetMemberDashboardVisitorsDownload @paramDate1=@0, @paramDate2=@1`;
        break;
    }
    if (qbQuery == '') {
      throw new NotFoundException('No Data Exist');
    }
    let result = await this.connection.query(`${qbQuery}`, [
      options.fromDate,
      options.toDate,
    ]);
    if (result.length) {
      let headerList = [];
      let headersData = Object.keys(result[0]);
      await headersData.reduce(async (promise, item) => {
        await promise;
        item;
        let itemObj = {
          header: item,
          key: item,
          width: 30,
        };
        headerList.push(itemObj);
      }, Promise.resolve());
      const currentDateTime = new Date();
      let file = await this.excelService.generateReport(
        `Report`,
        headerList,
        result,
      );
      return file;
    } else {
      throw new NotFoundException('Data not found for the given date range!');
    }
  }

  /* Get Top Visited Farms */
  async getTopVisitedFarms(options: TopVisitedFarmsDto) {
    let result = await this.connection.query(
      `EXEC procGetMainLandingDashboardTopVisitedFarms @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let response = [];

    await result.map(async (record: any) => {
      let diffPercent = 0;
      if (record.PreviousValue) {
        diffPercent = Math.round((record.Diff / record.PreviousValue) * 100);
      }
      response.push({
        ...record,
        diffPercent: diffPercent,
      });
    });
    if (options.limit) {
      if (response.length > options.limit) {
        response.length = options.limit;
      }
    }
    let farmVisites = await this.connection.query(
      `EXEC procGetMainLandingDashboardTotalVisitedFarmsAndVisits @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let visitCount = 0;
    farmVisites.forEach((item) => {
      visitCount += item.visitCount;
    });

    return { farmCount: farmVisites.length, visitCount, farms: response };
  }

  /* Get Total Registrations Data */
  async getTotalRegistrations(options: AppDashboardDto) {
    let result = await this.connection.query(
      `EXEC procGetMemberDashboardNewRegistrations @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let response = [];

    await result.map(async (record: any) => {
      let diffPercent = 0;
      if (record.PrevValue) {
        diffPercent = Math.round((record.Diff / record.PrevValue) * 100);
      } else {
        diffPercent = Math.round(record.Diff / 0.01);
      }
      response.push({
        ...record,
        diffPercent: diffPercent,
      });
    });
    return response;
  }

  /* Get New Customers Data */
  async getNewCustomers(options: AppDashboardDto) {
    let result = await this.connection.query(
      `EXEC procGetMainLandingDashboardNewCustomers @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );

    return result;
  }

  /* Get Dashboard Visitors Data */
  async getDashboradVisitorData(options: AppDashboardDto) {
    let result = await this.connection.query(
      `EXEC procGetMemberDashboardVisitors @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let response = [];

    await result.map(async (record: any) => {
      let diffPercent = 0;
      if (record.PrevValue) {
        diffPercent = Math.round((record.Diff / record.PrevValue) * 100);
      } else {
        diffPercent = Math.round(record.Diff / 0.01);
      }
      response.push({
        ...record,
        diffPercent: diffPercent,
      });
    });
    return response[0];
  }

  /* Get Dashboard Visitors Report Data */
  async getDashboradVisitorReport(options: DashboardReportDto) {
    let result = await this.connection.query(
      `EXEC procGetCurrentAndPrevDates @paramDate1=@0, @paramDate2=@1`,
      [options.fromDate, options.toDate],
    );
    let response = {
      CurrentValue: 0,
      PrevValue: 0,
      Diff: 0,
      diffPercent: 0,
    };
    response.CurrentValue = await this.gaService.getAllPageVisitors(
      result[0].currFromDate,
      result[0].currToDate,
    );
    response.PrevValue = await this.gaService.getAllPageVisitors(
      result[0].prevFromDate,
      result[0].prevToDate,
    );
    response.Diff = response.CurrentValue - response.PrevValue;
    let newResult = [];
    newResult.push({
      SNo: 1,
      CurrentVisitorCount: response.CurrentValue,
      PreviousVisitorCount: response.PrevValue,
      Difference: response.Diff,
    });
    let headerList = [];
    let headersData = Object.keys(newResult[0]);
    await headersData.reduce(async (promise, item) => {
      await promise;
      item;
      let itemObj = {
        header: item,
        key: item,
        width: 30,
      };
      headerList.push(itemObj);
    }, Promise.resolve());
    let file = await this.excelService.generateReport(
      `Report`,
      headerList,
      newResult,
    );
    return file;
  }

  /* Get Dashboard Visitor Statistics Data */
  async getDashboradVisitorStatisticsData(options: AppDashboardDto) {
    let result = await this.connection.query(
      `EXEC procGetMemberDashboardVisitorsGraph @fromDate=@0, @toDate=@1`,
      [options.fromDate, options.toDate],
    );
    let currentTotal = 0;
    let previousTotal = 0;
    let finalResult = [];
    let rangeFrom = null;
    let rangeTo = null;
    await result.map(async (item, index) => {
      currentTotal = currentTotal + item.currRegRate;
      previousTotal = previousTotal + item.prevRegRate;
      switch (item.interval) {
        case 'DAY':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getDayFromDate(
              item.currdayDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getDayFromDate(item.currdayDate);
          }
          finalResult.push({
            label: this.commonUtilsService.getDayFromDate(item.currdayDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'WEEK':
          if (index === 0) {
            rangeFrom = `Week ${item.currWeekNumber}`;
          }
          if (index === result.length - 1) {
            rangeTo = `Week ${item.currWeekNumber}`;
          }
          finalResult.push({
            label: `Week ${item.currWeekNumber}`,
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'MONTH':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getMonthFromDate(
              item.currfromDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getMonthFromDate(
              item.currfromDate,
            );
          }
          finalResult.push({
            label: this.commonUtilsService.getMonthFromDate(item.currfromDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
        case 'YEAR':
          if (index === 0) {
            rangeFrom = this.commonUtilsService.getYearFromDate(
              item.currfromDate,
            );
          }
          if (index === result.length - 1) {
            rangeTo = this.commonUtilsService.getYearFromDate(
              item.currfromDate,
            );
          }
          finalResult.push({
            label: this.commonUtilsService.getYearFromDate(item.currfromDate),
            currentValue: item.currRegRate,
            previousValue: item.prevRegRate,
          });
          break;
      }
    });
    return {
      currentTotal,
      previousTotal,
      rangeFrom,
      rangeTo,
      result: finalResult,
    };
  }
}
