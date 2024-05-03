import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { format } from 'date-fns';
import { readFileSync } from 'fs';
import * as path from 'path';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { CountryService } from 'src/country/service/country.service';
import { FileUploadsService } from 'src/file-uploads/file-uploads.service';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorsesService } from 'src/horses/horses.service';
import { StallionsService } from 'src/stallions/stallions.service';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { HtmlToPdfService } from './html-to-pdf.service';
import { ReportBroodmareAffinityService } from './report-broodmare-affinity.service';
import { ReportSalesCatelogueService } from './report-sales-catelogue.service';
import { ReportStallionAffinityService } from './report-stallion-affinity.service';
import { ReportStallionShortlistService } from './report-stallion-shortlist.service';
import { ReportTemplatesCommonService } from './report-templates-common.service';
import { productCodeList } from 'src/utils/constants/product-code-list';

@Injectable()
export class ReportTemplatesService {
  constructor(
    @InjectRepository(Horse)
    readonly horseRepository: Repository<Horse>,
    readonly htmlToPdfService: HtmlToPdfService,
    readonly reportShortlistService: ReportStallionShortlistService,
    readonly horsesService: HorsesService,
    readonly commonUtilsService: CommonUtilsService,
    readonly fileUploadsService: FileUploadsService,
    readonly rtCommonService: ReportTemplatesCommonService,
    readonly configService: ConfigService,
    readonly reportBroodmareAffinityService: ReportBroodmareAffinityService,
    readonly stallionsService: StallionsService,
    readonly reportStallionAffinityService: ReportStallionAffinityService,
    readonly reportSalesCatelogueService: ReportSalesCatelogueService,
    readonly countryService: CountryService,
  ) {}

  async generateBroodMareSireReport(mareId, stallionIds, data, fullName) {
    const horseData = await this.horsesService.findHorseDetailsByHorseIdAndSex(
      mareId,
      'F',
    );
    let sireLinesData = await this.rtCommonService.getTopPerformingSireLines(
      stallionIds,
    );
    data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStyles',
      ),
      mareName: await this.commonUtilsService.toTitleCase(horseData.horseName),
      cob: horseData.countryCode,
      yob: horseData.yob,
      sireName: await this.commonUtilsService.toTitleCase(horseData.sireName),
      damName: await this.commonUtilsService.toTitleCase(horseData.damName),
      reportDate: format(new Date(), 'dd/MM/yy'),
      preparedFor: fullName,
      pedigree: await this.horsesService.getMareHypoMatingDetails(
        horseData.horseId,
        5,
      ),
      topperformingsirelines: await this.commonUtilsService.arrayToChunks(
        sireLinesData,
        28,
      ),
      graphs: await this.rtCommonService.getAptitudeAgeAndDistanceProfiles(
        horseData.sireId,
        horseData.damId,
      ),
      ...(await this.rtCommonService.getStallionFarmAndLocationsByStallionIds(
        stallionIds,
      )),
    };
    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/broodmaresire-report.html',
      ),
      'utf-8',
    );
    contents = contents.replace(
      `GRAPH_RADAR_BROODMARESIRE_AGE_XVALUES`,
      `GRAPH_RADAR_BROODMARESIRE_AGE_XVALUES = ` +
        JSON.stringify(data.graphs.ageProfile.labels),
    );
    contents = contents.replace(
      `GRAPH_RADAR_BROODMARESIRE_AGE_DATASETS`,
      `GRAPH_RADAR_BROODMARESIRE_AGE_DATASETS = ` +
        JSON.stringify(data.graphs.ageProfile.datasets),
    );

    contents = contents.replace(
      `GRAPH_RADAR_BROODMARESIRE_DISTANCE_XVALUES`,
      `GRAPH_RADAR_BROODMARESIRE_DISTANCE_XVALUES = ` +
        JSON.stringify(data.graphs.distanceProfile.labels),
    );
    contents = contents.replace(
      `GRAPH_RADAR_BROODMARESIRE_DISTANCE_DATASETS`,
      `GRAPH_RADAR_BROODMARESIRE_DISTANCE_DATASETS = ` +
        JSON.stringify(data.graphs.distanceProfile.datasets),
    );
    let s3ReportLocation = await this.htmlToPdfService.generatePDF(
      contents,
      `${this.configService.get(
        'file.s3DirReportBroodmareSirePdf',
      )}/${uuid()}/${data.mareName}-brood-mare-sire.pdf`,
      data,
      ['READY_GRAPH_AGE', 'READY_GRAPH_DISTANCE'],
    );
    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }

  async generateStallionMatchShortlistReport(
    mareId,
    stallionIds,
    data,
    fullName,
  ) {
    const horseData = await this.horsesService.findHorseDetailsByHorseIdAndSex(
      mareId,
      'F',
    );
    let stallionAnalysisSummary =
      await this.rtCommonService.getShortListStallionsByStallionIds(
        horseData.id,
        stallionIds,
      );
    let strikeRateRanges =
      await this.rtCommonService.getSuccessProfileStrikeRateRanges();
    await stallionAnalysisSummary.reduce(async (promise, record) => {
      await promise;
      await record.successProfile.reduce(async (promiseInner, spItem) => {
        await promiseInner;
        let tempPercent = '';
        let percent = 0;
        if (spItem.column2.name.includes('%')) {
          tempPercent = spItem.column2.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column2.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'S'),
            );
        }
        if (spItem.column3.name.includes('%')) {
          tempPercent = spItem.column3.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column3.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SS'),
            );
        }
        if (spItem.column4.name.includes('%')) {
          tempPercent = spItem.column4.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column4.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SSS'),
            );
        }
        if (spItem.column5.name.includes('%')) {
          tempPercent = spItem.column5.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column5.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDS'),
            );
        }
        if (spItem.column6.name.includes('%')) {
          tempPercent = spItem.column6.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column6.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDDD'),
            );
        }
      }, Promise.resolve());
      return record;
    }, Promise.resolve());
    //Sort By Rating
    stallionAnalysisSummary.sort(
      await this.commonUtilsService.sortByProperty('rating'),
    );
    //DESC Order
    stallionAnalysisSummary.reverse();
    let stallionAnalysisSummaryList =
      await this.rtCommonService.getShortlistSummaryList(
        stallionAnalysisSummary,
      );
    data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStyles',
      ),
      mareName: await this.commonUtilsService.toTitleCase(horseData.horseName),
      cob: horseData.countryCode,
      yob: horseData.yob,
      sireName: await this.commonUtilsService.toTitleCase(horseData.sireName),
      damName: await this.commonUtilsService.toTitleCase(horseData.damName),
      reportDate: format(new Date(), 'dd/MM/yy'),
      preparedFor: fullName,
      pedigree: await this.horsesService.getMareHypoMatingDetails(
        horseData.horseId,
        5,
      ),
      graphs: await this.rtCommonService.getAptitudeAgeAndDistanceProfiles(
        horseData.sireId,
        horseData.damId,
      ),
      feeRange: await this.rtCommonService.getStallionsPriceRangeByStallionIds(
        'AUD',
        stallionIds,
      ),
      shortlistStallionAnalysisSummary: stallionAnalysisSummaryList,
      ...(await this.rtCommonService.getStallionFarmAndLocationsByStallionIds(
        stallionIds,
      )),
    };
    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/stallion-match-shortlist-report.html',
      ),
      'utf-8',
    );
    contents = contents.replace(
      `GRAPH_SHORTLIST_DAM_AGE_XVALUES`,
      `GRAPH_SHORTLIST_DAM_AGE_XVALUES = ` +
        JSON.stringify(data.graphs.ageProfile.labels),
    );
    contents = contents.replace(
      `GRAPH_SHORTLIST_DAM_AGE_DATASETS`,
      `GRAPH_SHORTLIST_DAM_AGE_DATASETS = ` +
        JSON.stringify(data.graphs.ageProfile.datasets),
    );

    contents = contents.replace(
      `GRAPH_SHORTLIST_DAM_DISTANCE_XVALUES`,
      `GRAPH_SHORTLIST_DAM_DISTANCE_XVALUES = ` +
        JSON.stringify(data.graphs.distanceProfile.labels),
    );
    contents = contents.replace(
      `GRAPH_SHORTLIST_DAM_DISTANCE_DATASETS`,
      `GRAPH_SHORTLIST_DAM_DISTANCE_DATASETS = ` +
        JSON.stringify(data.graphs.distanceProfile.datasets),
    );

    /* BOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */
    let scriptData = '';
    let selectorsList = [
      'READY_SHORTLIST_DAM_GRAPH_AGE',
      'READY_SHORTLIST_DAM_GRAPH_DISTANCE',
    ];
    await data.shortlistStallionAnalysisSummary.reduce(
      async (promise, parentitem) => {
        await promise;
        await parentitem.reduce(async (promiseInner, item) => {
          let femaleData = item.graphs.ageProfile?.datasets[0]?.data;
          let maleData = item.graphs.ageProfile?.datasets[1]?.data;
          let highestAgeValue = 0
          if (femaleData.length > 0 && maleData.length > 0) {
            const finalArray = femaleData.concat(maleData);
            highestAgeValue = Math.max(...finalArray);
          }
          let ageStepSize = ((item.graphs.ageProfile?.datasets[0]?.data?.length > 0 && highestAgeValue > 5)? Math.round(highestAgeValue/5) : 1)

          femaleData = item.graphs.distanceProfile?.datasets[0]?.data;
          maleData = item.graphs.distanceProfile?.datasets[1]?.data;
          let highestDistValue = 0
          if (femaleData.length > 0 && maleData.length > 0) {
            const finalArray = femaleData.concat(maleData);
            highestDistValue = Math.max(...finalArray);
          }
          let distStepSize = ((item.graphs.distanceProfile?.datasets[0]?.data?.length > 0 && highestDistValue > 5)? Math.round(highestDistValue/5) : 1)

          await promiseInner;
          let index = item.stallionId;
          scriptData =
            scriptData +
            `<script type="text/javascript">
      var ageChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_AGE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.ageProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.ageProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var image_${index} = ageChart_${index}.toBase64Image();
                  var ageChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_AGE_IMAGE_${index}')
                  ageChartImage_${index}.src = image_${index}
                  let ageChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_AGE_${index}");
                  ageChartElement_${index}.remove()
                  const ageElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(ageElements_${index}.length > 0){
                    ageElements_${index}[0].parentNode.removeChild(ageElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_AGE_${index}").style.visibility = "visible";
              },
          },
          scales: {
            r: {
              ticks: {
                beginAtZero: true,
                stepSize: ${ageStepSize}
              }
            }
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Age',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });
      var distanceChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.distanceProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.distanceProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var distanceImage_${index} = distanceChart_${index}.toBase64Image();
                  var distanceChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_IMAGE_${index}')
                  distanceChartImage_${index}.src = distanceImage_${index}
                  let distanceChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_DISTANCE_${index}");
                  distanceChartElement_${index}.remove()
                  const distanceElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(distanceElements_${index}.length > 0){
                    distanceElements_${index}[0].parentNode.removeChild(distanceElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_DISTANCE_${index}").style.visibility = "visible";
              },
          },
          scales: {
            r: {
              ticks: {
                beginAtZero: true,
                stepSize: ${distStepSize}
              }
            }
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Distance',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });
    </script>`;
          selectorsList.push(`READY_STALLION_GRAPH_AGE_${index}`);
          selectorsList.push(`READY_STALLION_GRAPH_DISTANCE_${index}`);
        }, Promise.resolve());
      },
      Promise.resolve(),
    );
    //return scriptData
    scriptData = scriptData + '</body>';
    contents = contents.replace(`</body>`, scriptData);
    /* EOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */
    let s3ReportLocation = await this.htmlToPdfService.generatePDF(
      contents,
      `${this.configService.get(
        'file.s3DirReportStallionShortlistPdf',
      )}/${uuid()}/${data.mareName}-shortlist.pdf`,
      data,
      selectorsList,
    );
    // return s3ReportLocation
    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }

  async generateStallionMatchProReport(mareId, stallionIds, data, fullName) {
    const horseData = await this.horsesService.findHorseDetailsByHorseIdAndSex(
      mareId,
      'F',
    );
    let stallionAnalysisSummary =
      await this.rtCommonService.getShortListStallionsByStallionIds(
        horseData.id,
        stallionIds,
      );
    let strikeRateRanges =
      await this.rtCommonService.getSuccessProfileStrikeRateRanges();
    await stallionAnalysisSummary.reduce(async (promise, record) => {
      await promise;
      await record.successProfile.reduce(async (promiseInner, spItem) => {
        await promiseInner;
        let tempPercent = '';
        let percent = 0;
        if (spItem.column2.name.includes('%')) {
          tempPercent = spItem.column2.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column2.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'S'),
            );
        }
        if (spItem.column3.name.includes('%')) {
          tempPercent = spItem.column3.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column3.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SS'),
            );
        }
        if (spItem.column4.name.includes('%')) {
          tempPercent = spItem.column4.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column4.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SSS'),
            );
        }
        if (spItem.column5.name.includes('%')) {
          tempPercent = spItem.column5.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column5.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDS'),
            );
        }
        if (spItem.column6.name.includes('%')) {
          tempPercent = spItem.column6.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column6.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDDD'),
            );
        }
      }, Promise.resolve());
      return record;
    }, Promise.resolve());
    //Sort By Rating
    stallionAnalysisSummary.sort(
      await this.commonUtilsService.sortByProperty('rating'),
    );
    //DESC Order
    stallionAnalysisSummary.reverse();
    let stallionAnalysisSummaryList =
      await this.rtCommonService.getShortlistSummaryList(
        stallionAnalysisSummary,
      );
    data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStyles',
      ),
      mareName: await this.commonUtilsService.toTitleCase(horseData.horseName),
      cob: horseData.countryCode,
      yob: horseData.yob,
      sireName: await this.commonUtilsService.toTitleCase(horseData.sireName),
      damName: await this.commonUtilsService.toTitleCase(horseData.damName),
      reportDate: format(new Date(), 'dd/MM/yy'),
      preparedFor: fullName,
      pedigree: await this.horsesService.getMareHypoMatingDetails(
        horseData.horseId,
        5,
      ),
      graphs: await this.rtCommonService.getAptitudeAgeAndDistanceProfiles(
        horseData.sireId,
        horseData.damId,
      ),
      feeRange: await this.rtCommonService.getStallionsPriceRangeByStallionIds(
        'AUD',
        stallionIds,
      ),
      proStallionAnalysisSummary: stallionAnalysisSummaryList,
      ...(await this.rtCommonService.getStallionFarmAndLocationsByStallionIds(
        stallionIds,
      )),
    };
    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/stallion-match-pro-report.html',
      ),
      'utf-8',
    );
    contents = contents.replace(
      `GRAPH_PRO_DAM_AGE_XVALUES`,
      `GRAPH_PRO_DAM_AGE_XVALUES = ` +
        JSON.stringify(data.graphs.ageProfile.labels),
    );
    contents = contents.replace(
      `GRAPH_PRO_DAM_AGE_DATASETS`,
      `GRAPH_PRO_DAM_AGE_DATASETS = ` +
        JSON.stringify(data.graphs.ageProfile.datasets),
    );

    contents = contents.replace(
      `GRAPH_PRO_DAM_DISTANCE_XVALUES`,
      `GRAPH_PRO_DAM_DISTANCE_XVALUES = ` +
        JSON.stringify(data.graphs.distanceProfile.labels),
    );
    contents = contents.replace(
      `GRAPH_PRO_DAM_DISTANCE_DATASETS`,
      `GRAPH_PRO_DAM_DISTANCE_DATASETS = ` +
        JSON.stringify(data.graphs.distanceProfile.datasets),
    );

    /* BOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */
    let scriptData = '';
    let selectorsList = [
      'READY_PRO_DAM_GRAPH_AGE',
      'READY_PRO_DAM_GRAPH_DISTANCE',
    ];
    await data.proStallionAnalysisSummary.reduce(
      async (promise, parentitem) => {
        await promise;
        await parentitem.reduce(async (promiseInner, item) => {
          await promiseInner;
          let index = item.stallionId;
          scriptData =
            scriptData +
            `<script type="text/javascript">
      var ageChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_AGE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.ageProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.ageProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var image_${index} = ageChart_${index}.toBase64Image();
                  var ageChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_AGE_IMAGE_${index}')
                  ageChartImage_${index}.src = image_${index}
                  let ageChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_AGE_${index}");
                  ageChartElement_${index}.remove()
                  const ageElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(ageElements_${index}.length > 0){
                    ageElements_${index}[0].parentNode.removeChild(ageElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_AGE_${index}").style.visibility = "visible";
              },
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Age',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });
      var distanceChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.distanceProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.distanceProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var distanceImage_${index} = distanceChart_${index}.toBase64Image();
                  var distanceChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_IMAGE_${index}')
                  distanceChartImage_${index}.src = distanceImage_${index}
                  let distanceChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_DISTANCE_${index}");
                  distanceChartElement_${index}.remove()
                  const distanceElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(distanceElements_${index}.length > 0){
                    distanceElements_${index}[0].parentNode.removeChild(distanceElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_DISTANCE_${index}").style.visibility = "visible";
              },
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Distance',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });
    </script>`;
          selectorsList.push(`READY_STALLION_GRAPH_AGE_${index}`);
          selectorsList.push(`READY_STALLION_GRAPH_DISTANCE_${index}`);
        }, Promise.resolve());
      },
      Promise.resolve(),
    );
    //return scriptData
    scriptData = scriptData + '</body>';
    contents = contents.replace(`</body>`, scriptData);
    /* EOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */

    let s3ReportLocation = await this.htmlToPdfService.generatePDF(
      contents,
      `${this.configService.get('file.s3DirReportSMProPdf')}/${uuid()}/${
        data.mareName
      }-pro.pdf`,
      data,
      selectorsList,
    );
    //return s3ReportLocation
    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }

  async generateBroodmareAffinityReport(
    mareId,
    countryId,
    data,
    fullName,
    email,
  ) {
    const horseData = await this.horsesService.findHorseDetailsByHorseIdAndSex(
      mareId,
      'F',
    );
    const pedigree = await this.horsesService.getMareHypoMatingDetails(
      horseData.horseId,
      5,
    );
    const sPositionStrikeRateRanges =
      await this.reportBroodmareAffinityService.getBroodmareAffinityStrikeRateRanges(
        'S',
      );
    const { commonAncestorsList, commonAncestorsTabelTitles } =
      await this.reportBroodmareAffinityService.getAncestorsAffinityWithBroodMareSummaryList(
        horseData.id,
        countryId,
        sPositionStrikeRateRanges,
      );
    const stakeWinnersComparisonList =
      await this.reportBroodmareAffinityService.getBroodmareAffinityStakeWinnersComparisonList(
        horseData.id,
        countryId,
      );
    const topperformingsirelines =
      await this.reportBroodmareAffinityService.getBroodmareAffinityTopperformingsirelines(
        horseData.id,
        countryId,
        sPositionStrikeRateRanges,
      );
    const country = await this.countryService.getCountryById(countryId);
    data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStyles',
      ),
      mareName: await this.commonUtilsService.toTitleCase(horseData.horseName),
      cob: horseData.countryCode,
      yob: horseData.yob,
      sireName: await this.commonUtilsService.toTitleCase(horseData.sireName),
      damName: await this.commonUtilsService.toTitleCase(horseData.damName),
      reportDate: format(new Date(), 'dd/MM/yy'),
      preparedFor: fullName,
      preparedForEmail: email,
      locations: country.countryName,
      pedigree: pedigree,
      ancestorsAffinityHeader: commonAncestorsTabelTitles,
      commonAncestorsList:
        await this.commonUtilsService.commonAncestorsListToChunks(
          commonAncestorsList,
          33,
          14,
        ),
      stakeWinners: await this.commonUtilsService.arrayToChunks(
        stakeWinnersComparisonList,
        27,
      ),
      topperformingsirelines: await this.commonUtilsService.arrayToChunks(
        topperformingsirelines,
        27,
      ),
    };

    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/broodmare-affinity-report.html',
      ),
      'utf-8',
    );

    let s3ReportLocation = await this.htmlToPdfService.generatePDF(
      contents,
      `${this.configService.get(
        'file.s3DirReportBroodmareAffinityPdf',
      )}/${uuid()}/${data.mareName}-broodmare-affinity.pdf`,
      data,
      [],
    );
    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }

  async generateSalesCatelogueReport(orderProductId: number, fullName: string) {
    const orderData =
      await this.reportSalesCatelogueService.findOrderInfoByOrderId(
        orderProductId,productCodeList.REPORT_STALLION_MATCH_SALES
      );
    const saleData =
      await this.reportSalesCatelogueService.findSaleInfoBySaleId(
        orderData[0].sales,
      );
    let horseIds = [];
    horseIds = await Promise.all(
      orderData.map(async (element) => {
        return element.lotId;
      }),
    );
    if (horseIds.length > 2) {
      horseIds = horseIds.slice(0, 2);
    }
    let stallionAnalysisSummary =
      await this.rtCommonService.getSalesLotsByHorseIds(
        horseIds,
        saleData?.countryId,
        1,
        null
      );

    let strikeRateRanges =
      await this.rtCommonService.getSuccessProfileStrikeRateRanges();
    await stallionAnalysisSummary.reduce(async (promise, record) => {
      await promise;
      await record.successProfile.reduce(async (promiseInner, spItem) => {
        await promiseInner;
        let tempPercent = '';
        let percent = 0;
        if (spItem.column2.name.includes('%')) {
          tempPercent = spItem.column2.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column2.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'S'),
            );
        }
        if (spItem.column3.name.includes('%')) {
          tempPercent = spItem.column3.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column3.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SS'),
            );
        }
        if (spItem.column4.name.includes('%')) {
          tempPercent = spItem.column4.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column4.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SSS'),
            );
        }
        if (spItem.column5.name.includes('%')) {
          tempPercent = spItem.column5.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column5.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDS'),
            );
        }
        if (spItem.column6.name.includes('%')) {
          tempPercent = spItem.column6.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column6.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDDD'),
            );
        }
      }, Promise.resolve());

      await record.impactProfile.reduce(async (promiseInner, spItem) => {
        await promiseInner;
        let tempPercent = '';
        let percent = 0;
        if (spItem.column2.name && spItem.column2.name.includes('%')) {
          tempPercent = spItem.column2.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column2.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'S'),
            );
        }
        if (spItem.column3.name && spItem.column3.name.includes('%')) {
          tempPercent = spItem.column3.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column3.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SS'),
            );
        }
        if (spItem.column4.name && spItem.column4.name.includes('%')) {
          tempPercent = spItem.column4.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column4.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SSS'),
            );
        }
        if (spItem.column5.name && spItem.column5.name.includes('%')) {
          tempPercent = spItem.column5.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column5.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDS'),
            );
        }
        if (spItem.column6.name && spItem.column6.name.includes('%')) {
          tempPercent = spItem.column6.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column6.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDDD'),
            );
        }
      }, Promise.resolve());

      return record;
    }, Promise.resolve());

    stallionAnalysisSummary.sort(
      await this.commonUtilsService.sortByProperty('rating'),
    );
    //DESC Order
    stallionAnalysisSummary.reverse();
    let stallionAnalysisSummaryList =
      await this.rtCommonService.getShortlistSummaryList(
        stallionAnalysisSummary,
      );

    let data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStyles',
      ),
      reportDate: format(new Date(), 'dd/MM/yy'),
      preparedFor: fullName,
      companyName: saleData?.companyName,
      saleName: saleData?.saleName,
      totalLots: orderData[0]?.quantity,
      createdDate: saleData?.startDate
        ? format(new Date(orderData[0].createdDate), 'dd/MM/yy')
        : 'N/A',
      salesAnalysisSummary: stallionAnalysisSummaryList,
    };

    let contents = readFileSync(
      path.join(process.cwd(), '/src/report-templates/hbs/sales-report.html'),
      'utf-8',
    );

    /* BOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */
    let scriptData = '';
    let selectorsList = [];
    await data.salesAnalysisSummary.reduce(async (promise, parentitem) => {
      await promise;
      await parentitem.reduce(async (promiseInner, item) => {
        await promiseInner;
        let index = item.horseId;
        scriptData =
          scriptData +
          `<script type="text/javascript">
      var ageChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_AGE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.ageProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.ageProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var image_${index} = ageChart_${index}.toBase64Image();
                  var ageChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_AGE_IMAGE_${index}')
                  ageChartImage_${index}.src = image_${index}
                  let ageChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_AGE_${index}");
                  ageChartElement_${index}.remove()
                  const ageElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(ageElements_${index}.length > 0){
                    ageElements_${index}[0].parentNode.removeChild(ageElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_AGE_${index}").style.visibility = "visible";
              },
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Age',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });
      var distanceChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.distanceProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.distanceProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var distanceImage_${index} = distanceChart_${index}.toBase64Image();
                  var distanceChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_IMAGE_${index}')
                  distanceChartImage_${index}.src = distanceImage_${index}
                  let distanceChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_DISTANCE_${index}");
                  distanceChartElement_${index}.remove()
                  const distanceElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(distanceElements_${index}.length > 0){
                    distanceElements_${index}[0].parentNode.removeChild(distanceElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_DISTANCE_${index}").style.visibility = "visible";
              },
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Distance',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });

      
        
       var aptitudeChart_${index} = new Chart(document.getElementById('GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_${index}').getContext('2d'), {
          type: "bubble",
          data: {
            datasets: ${JSON.stringify(
              item.graphs.aptitudeProfile['aptitudeDatasets'],
            )}
          },
          options: {
            backgroundColor: "#f00",
            plugins: {
                legend: {
                    display: false
                },
            },
            scales: {
                y: {
                    type: 'category',
                    labels: ${JSON.stringify(
                      item.graphs.aptitudeProfile['aptitudeYAxisLabels'],
                    )},
                    grid: {
                        borderColor: "#B0B6AF",
                        //borderDashOffset: 2,
                    },  
                },
                x: {
                    type: 'category',
                    labels: ${JSON.stringify(
                      item.graphs.aptitudeProfile['aptitudeXAxisLabels'],
                    )},
                    grid: {
                        borderColor: "#B0B6AF",
                        //borderDashOffset: 2,
                    },
                },
            },
            animation: {
                onComplete: function () {
                    var aptitudeImage_${index} = aptitudeChart_${index}.toBase64Image();
                    var aptitudeChartImage_${index} = document.getElementById('GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_IMAGE_${index}')
                    aptitudeChartImage_${index}.src = aptitudeImage_${index}
                    let aptitudeChartElement_${index} = document.getElementById("GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_${index}");
                    if (aptitudeChartElement_${index}){
                        aptitudeChartElement_${index}.remove()
                    }
                    const elements = document.getElementsByClassName("chartjs-size-monitor");
                    while(elements.length > 0){
                        elements[0].parentNode.removeChild(elements[0]);
                    }
                    document.getElementById('READY_SALES_GRAPH_APTITUDE_${index}').style.visibility = 'visible';
                },
            },
          }
        }); 

    </script>`;
        selectorsList.push(`READY_STALLION_GRAPH_AGE_${index}`);
        selectorsList.push(`READY_STALLION_GRAPH_DISTANCE_${index}`);
        selectorsList.push(`READY_SALES_GRAPH_APTITUDE_${index}`);
      }, Promise.resolve());
    }, Promise.resolve());
    //return scriptData
    scriptData = scriptData + '</body>';
    contents = contents.replace(`</body>`, scriptData);
    /* EOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */

    let s3ReportLocation = await this.htmlToPdfService.generatePDF(
      contents,
      `${this.configService.get(
        'file.s3DirReportSalesCateloguePdf',
      )}/${uuid()}/${saleData?.saleName}-sales-catelogue.pdf`,
      data,
      selectorsList,
    );
    // return s3ReportLocation
    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }

  async generateStallionAffinityReport(stallionId, data, fullName, email) {
    const stallionData = await this.reportStallionAffinityService.getStallion(
      stallionId,
    );

    const horseData = await this.horsesService.findHorseDetailsByHorseIdAndSex(
      stallionData.horseId,
      'M',
    );
    const pedigree = await this.horsesService.getMareHypoMatingDetails(
      horseData.horseId,
      5,
    );
    const sPositionStrikeRateRanges =
      await this.reportStallionAffinityService.getStallionAffinityStrikeRateRanges(
        'S',
      );
    const { commonAncestorsList, commonAncestorsTabelTitles } =
      await this.reportStallionAffinityService.getAncestorsAffinityWithSireSummaryList(
        stallionData.id,
        sPositionStrikeRateRanges,
      );
    const stakeWinnersComparisonList =
      await this.reportStallionAffinityService.getStallionAffinityStakeWinnersComparisonList(
        stallionData.id,
      );
    const topperformingBroodMareSires =
      await this.reportStallionAffinityService.getStallionAffinityTopperformingBroodMareSires(
        stallionData.id,
        sPositionStrikeRateRanges,
      );

    data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStyles',
      ),
      horseName: await this.commonUtilsService.toTitleCase(horseData.horseName),
      cob: horseData.countryCode,
      yob: horseData.yob,
      sireName: await this.commonUtilsService.toTitleCase(horseData.sireName),
      damName: await this.commonUtilsService.toTitleCase(horseData.damName),
      reportDate: format(new Date(), 'dd/MM/yy'),
      preparedFor: fullName,
      preparedForEmail: email,
      pedigree: pedigree,
      ancestorsAffinityHeader: commonAncestorsTabelTitles,
      commonAncestorsList:
        await this.commonUtilsService.commonAncestorsListToChunks(
          commonAncestorsList,
          33,
          14,
        ),
      stakeWinners: await this.commonUtilsService.arrayToChunks(
        stakeWinnersComparisonList,
        27,
      ),
      topperformingBroodMareSires: await this.commonUtilsService.arrayToChunks(
        topperformingBroodMareSires,
        27,
      ),
    };

    let contents = readFileSync(
      path.join(
        process.cwd(),
        '/src/report-templates/hbs/stallion-affinity-report.html',
      ),
      'utf-8',
    );

    let s3ReportLocation = await this.htmlToPdfService.generatePDF(
      contents,
      `${this.configService.get(
        'file.s3DirReportStallionAffinityPdf',
      )}/${uuid()}/${data.horseName}-stallion-affinity.pdf`,
      data,
      [],
    );

    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }

  async generateStockSaleReport(orderProductId: number, fullName: string) {
    const orderData =
      await this.reportSalesCatelogueService.findOrderInfoByOrderId(
        orderProductId, productCodeList.REPORT_STALLION_BREEDING_STOCK_SALE
      );
      console.log('orderData',orderData)
    const saleData =
      await this.reportSalesCatelogueService.findSaleInfoBySaleId(
        orderData[0].sales,
      );
    let horseIds = [];
    horseIds = await Promise.all(
      orderData.map(async (element) => {
        return element.lotId;
      }),
    );
    if (horseIds.length > 2) {
      horseIds = horseIds.slice(0, 2);
    }
    let stallionAnalysisSummary =
      await this.rtCommonService.getSalesLotsByHorseIds(
        horseIds,
        saleData?.countryId,
        2,
        orderData[0].stallionId
      );

    let strikeRateRanges =
      await this.rtCommonService.getSuccessProfileStrikeRateRanges();
    await stallionAnalysisSummary.reduce(async (promise, record) => {
      await promise;
      await record.successProfile.reduce(async (promiseInner, spItem) => {
        await promiseInner;
        let tempPercent = '';
        let percent = 0;
        if (spItem.column2.name.includes('%')) {
          tempPercent = spItem.column2.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column2.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'S'),
            );
        }
        if (spItem.column3.name.includes('%')) {
          tempPercent = spItem.column3.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column3.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SS'),
            );
        }
        if (spItem.column4.name.includes('%')) {
          tempPercent = spItem.column4.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column4.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SSS'),
            );
        }
        if (spItem.column5.name.includes('%')) {
          tempPercent = spItem.column5.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column5.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDS'),
            );
        }
        if (spItem.column6.name.includes('%')) {
          tempPercent = spItem.column6.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column6.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDDD'),
            );
        }
      }, Promise.resolve());

      await record.impactProfile.reduce(async (promiseInner, spItem) => {
        await promiseInner;
        let tempPercent = '';
        let percent = 0;
        if (spItem.column2.name && spItem.column2.name.includes('%')) {
          tempPercent = spItem.column2.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column2.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'S'),
            );
        }
        if (spItem.column3.name && spItem.column3.name.includes('%')) {
          tempPercent = spItem.column3.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column3.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SS'),
            );
        }
        if (spItem.column4.name && spItem.column4.name.includes('%')) {
          tempPercent = spItem.column4.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column4.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SSS'),
            );
        }
        if (spItem.column5.name && spItem.column5.name.includes('%')) {
          tempPercent = spItem.column5.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column5.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDS'),
            );
        }
        if (spItem.column6.name && spItem.column6.name.includes('%')) {
          tempPercent = spItem.column6.name;
          percent = Number(tempPercent.split('%')[0]);
          spItem.column6.color =
            await this.rtCommonService.getColourCodeForSuccessProfile(
              percent,
              strikeRateRanges.filter((obj) => obj.prefix == 'SDDD'),
            );
        }
      }, Promise.resolve());

      return record;
    }, Promise.resolve());

    stallionAnalysisSummary.sort(
      await this.commonUtilsService.sortByProperty('rating'),
    );
    //DESC Order
    stallionAnalysisSummary.reverse();
    let stallionAnalysisSummaryList =
      await this.rtCommonService.getShortlistSummaryList(
        stallionAnalysisSummary,
      );

    let data = {
      pathReportTemplateStyles: this.configService.get(
        'file.pathReportTemplateStyles',
      ),
      reportDate: format(new Date(), 'dd/MM/yy'),
      preparedFor: fullName,
      companyName: saleData?.companyName,
      saleName: saleData?.saleName,
      totalLots: orderData[0]?.quantity,
      createdDate: saleData?.startDate
        ? format(new Date(orderData[0].createdDate), 'dd/MM/yy')
        : 'N/A',
      salesAnalysisSummary: stallionAnalysisSummaryList,
    };

    let contents = readFileSync(
      path.join(process.cwd(), '/src/report-templates/hbs/stock-sale-report.html'),
      'utf-8',
    );

    /* BOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */
    let scriptData = '';
    let selectorsList = [];
    await data.salesAnalysisSummary.reduce(async (promise, parentitem) => {
      await promise;
      await parentitem.reduce(async (promiseInner, item) => {
        await promiseInner;
        let index = item.horseId;
        scriptData =
          scriptData +
          `<script type="text/javascript">
      var ageChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_AGE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.ageProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.ageProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var image_${index} = ageChart_${index}.toBase64Image();
                  var ageChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_AGE_IMAGE_${index}')
                  ageChartImage_${index}.src = image_${index}
                  let ageChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_AGE_${index}");
                  ageChartElement_${index}.remove()
                  const ageElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(ageElements_${index}.length > 0){
                    ageElements_${index}[0].parentNode.removeChild(ageElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_AGE_${index}").style.visibility = "visible";
              },
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Age',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });
      var distanceChart_${index} = new Chart(document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_${index}').getContext('2d'), {
        type: "radar",
        data: {
          labels: ${JSON.stringify(item.graphs.distanceProfile.labels)},
          datasets: ${JSON.stringify(item.graphs.distanceProfile.datasets)}
        },
        options: {
          animation: {
              onComplete: function () {
                  var distanceImage_${index} = distanceChart_${index}.toBase64Image();
                  var distanceChartImage_${index} = document.getElementById('GRAPH_RADAR_STALLION_DISTANCE_IMAGE_${index}')
                  distanceChartImage_${index}.src = distanceImage_${index}
                  let distanceChartElement_${index} = document.getElementById("GRAPH_RADAR_STALLION_DISTANCE_${index}");
                  distanceChartElement_${index}.remove()
                  const distanceElements_${index} = document.getElementsByClassName("chartjs-size-monitor");
                  while(distanceElements_${index}.length > 0){
                    distanceElements_${index}[0].parentNode.removeChild(distanceElements_${index}[0]);
                  }
                  document.getElementById("READY_STALLION_GRAPH_DISTANCE_${index}").style.visibility = "visible";
              },
          },
          elements: {
              line: {
                  borderWidth: 3
              }
          },
          plugins: {
          legend: {
            position: 'bottom',
            // align: 'end'
          },
          title: {
              display: true,
              text: 'Distance',
              position:'bottom',
              color:'#000000',
              font: {
                  size: 16
              }
          }
        }
        }
      });

      
        
       var aptitudeChart_${index} = new Chart(document.getElementById('GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_${index}').getContext('2d'), {
          type: "bubble",
          data: {
            datasets: ${JSON.stringify(
              item.graphs.aptitudeProfile['aptitudeDatasets'],
            )}
          },
          options: {
            backgroundColor: "#f00",
            plugins: {
                legend: {
                    display: false
                },
            },
            scales: {
                y: {
                    type: 'category',
                    labels: ${JSON.stringify(
                      item.graphs.aptitudeProfile['aptitudeYAxisLabels'],
                    )},
                    grid: {
                        borderColor: "#B0B6AF",
                        //borderDashOffset: 2,
                    },  
                },
                x: {
                    type: 'category',
                    labels: ${JSON.stringify(
                      item.graphs.aptitudeProfile['aptitudeXAxisLabels'],
                    )},
                    grid: {
                        borderColor: "#B0B6AF",
                        //borderDashOffset: 2,
                    },
                },
            },
            animation: {
                onComplete: function () {
                    var aptitudeImage_${index} = aptitudeChart_${index}.toBase64Image();
                    var aptitudeChartImage_${index} = document.getElementById('GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_IMAGE_${index}')
                    aptitudeChartImage_${index}.src = aptitudeImage_${index}
                    let aptitudeChartElement_${index} = document.getElementById("GRAPH_BUBBLE_STALLIONSEARCH_APTITUDE_${index}");
                    if (aptitudeChartElement_${index}){
                        aptitudeChartElement_${index}.remove()
                    }
                    const elements = document.getElementsByClassName("chartjs-size-monitor");
                    while(elements.length > 0){
                        elements[0].parentNode.removeChild(elements[0]);
                    }
                    document.getElementById('READY_SALES_GRAPH_APTITUDE_${index}').style.visibility = 'visible';
                },
            },
          }
        }); 

    </script>`;
        selectorsList.push(`READY_STALLION_GRAPH_AGE_${index}`);
        selectorsList.push(`READY_STALLION_GRAPH_DISTANCE_${index}`);
        //selectorsList.push(`READY_SALES_GRAPH_APTITUDE_${index}`);
      }, Promise.resolve());
    }, Promise.resolve());
    //return scriptData
    scriptData = scriptData + '</body>';
    contents = contents.replace(`</body>`, scriptData);
    /* EOF SCRIPT - WHICH APPEND BEFORE END OF BODY TAG */

    let s3ReportLocation = await this.htmlToPdfService.generatePDF(
      contents,
      `${this.configService.get(
        'file.s3DirReportStockSalePdf',
      )}/${uuid()}/${saleData?.saleName}-stock-sale.pdf`,
      data,
      selectorsList,
    );
    // return s3ReportLocation
    return await this.fileUploadsService.generateUrlWithCustomExpireTime(
      s3ReportLocation,
    );
  }


}
