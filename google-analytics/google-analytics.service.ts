import { Injectable } from '@nestjs/common';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { ConfigService } from '@nestjs/config';
import { format } from 'date-fns';

@Injectable()
export class GoogleAnalyticsService {
  constructor(private readonly configService: ConfigService) {}

  /*Sample code snippet
     async getAllSamples() {
        const entities = await this.gaService.getAnalyticData(
        [
            {
            startDate: '2023-02-09',
            endDate: 'today',
            },
            {
            startDate: '2023-03-01',
            endDate: '2023-03-02',
            },
        ],
        [
            {
            name: 'unifiedScreenClass',
            },
        ],
        [
            {
            name: 'screenPageViews',
            },
        ],
        {
            filter: {
                fieldName: 'unifiedScreenClass',
                stringFilter: {
                    matchType: 'EXACT',
                    value: 'React App | Landing Page'
                }
            }
        }
        );
    }*/

  /* CORE METHOD
   * DO NOT MODIFY IT, UNTIL AND UNLESS LIBRARY CHANGE
   */
  async getAnalyticData(
    dateRanges,
    dimensions,
    metrics,
    dimensionFilter = null,
  ) {
    const analyticsDataClient = new BetaAnalyticsDataClient();
    let filters = {
      property: `properties/${this.configService.get('ga4.propertyId')}`,
      dateRanges,
      dimensions,
      metrics,
      dimensionFilter,
    };
    if (!dimensionFilter) {
      delete filters.dimensionFilter;
    }
    return await analyticsDataClient.runReport(filters);
  }

  //Get User Session Data
  async getSessionsData(startDate, endDate) {
    let data = await this.getAnalyticData(
      [
        {
          startDate: format(startDate, 'Y-MM-dd'),
          endDate: format(endDate, 'Y-MM-dd'),
        },
      ],
      [
        {
          name: 'landingPagePlusQueryString',
        },
      ],
      [
        {
          name: 'sessions',
        },
      ],
    );
    if (!data[0].rowCount) {
      return 0;
    }
    return parseInt(data[0].rows[0].metricValues[0].value);
  }

  //Get Farm Page Visitors
  async getFarmPageVisitors(startDate, endDate) {
    const data = await this.getAnalyticData(
      [
        {
          startDate: format(startDate, 'Y-MM-dd'),
          endDate: format(endDate, 'Y-MM-dd'),
        },
      ],
      [
        {
          name: 'unifiedScreenClass',
        },
      ],
      [
        {
          name: 'screenPageViews',
        },
      ],
      {
        filter: {
          fieldName: 'unifiedScreenClass',
          stringFilter: {
            matchType: 'EXACT',
            value: 'Farm Dashboard | Stallion Match',
            //value: 'Stallion Marketing Platform | Stallion Match'
          },
        },
      },
    );

    if (!data[0].rowCount) {
      return 0;
    }
    return parseInt(data[0].rows[0].metricValues[0].value);
  }

  //Get All Page Visitors
  async getAllPageVisitors(startDate, endDate) {
    const data = await this.getAnalyticData(
      [
        {
          startDate: format(startDate, 'Y-MM-dd'),
          endDate: format(endDate, 'Y-MM-dd'),
        },
      ],
      [
        {
          name: 'date',
        },
      ],
      [
        {
          name: 'screenPageViews',
        },
      ],
    );

    if (!data[0].rowCount) {
      return 0;
    }
    return parseInt(data[0].rows[0].metricValues[0].value);
  }

  //Get Member WorldReach Data
  async getMemberWorldReachData(startDate, endDate) {
    let data = await this.getAnalyticData(
      [
        {
          startDate: format(startDate, 'Y-MM-dd'),
          endDate: format(endDate, 'Y-MM-dd'),
        },
      ],
      [
        {
          name: 'country',
        },
        {
          name: 'countryId',
        },
      ],
      [
        {
          name: 'totalUsers',
        },
        {
          name: 'sessions',
        },
      ],
    );
    return data;
  }

  //Get HomePage Visitors
  async getHomePageVisitors(startDate, endDate) {
    const data = await this.getAnalyticData(
      [
        {
          startDate: format(startDate, 'Y-MM-dd'),
          endDate: format(endDate, 'Y-MM-dd'),
        },
      ],
      [
        {
          name: 'unifiedScreenClass',
        },
      ],
      [
        {
          name: 'screenPageViews',
        },
      ],
      {
        filter: {
          fieldName: 'unifiedScreenClass',
          stringFilter: {
            matchType: 'EXACT',
            value: 'Stallion Match Portal',
            //value: 'Stallion Marketing Platform | Stallion Match' Home page!
          },
        },
      },
    );

    if (!data[0].rowCount) {
      return 0;
    }
    return parseInt(data[0].rows[0].metricValues[0].value);
  }
}
