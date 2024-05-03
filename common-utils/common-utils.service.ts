import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import * as mime from 'mime-types';
import * as moment from 'moment';
import { PRODUCTCOVERIMAGE } from 'src/utils/constants/product-code-list';

@Injectable()
export class CommonUtilsService {
  constructor(private readonly configService: ConfigService) {}

  /* Get All Promotions Status */
  async getAllPromotionsStatus() {
    return [
      {
        id: 1,
        name: 'Promoted',
      },
      {
        id: 2,
        name: 'Non-Promoted',
      },
    ];
  }

  /* Get All Fee Status */
  async getAllFeeStatus() {
    return [
      {
        id: 1,
        name: 'Farm Update',
      },
      {
        id: 2,
        name: 'Internal Update',
      },
      {
        id: 3,
        name: 'External Update',
      },
    ];
  }

  /* Get File Path By FileKey */
  async getFilePathByFileKey(fileKey) {
    let fileLocation =
      'https://' +
      this.configService.get('file.awsDefaultS3Bucket') +
      '.s3.' +
      this.configService.get('file.awsS3Region') +
      '.amazonaws.com/' +
      fileKey;
    return fileLocation;
  }

  /* Get Years List */
  async getYearsList(start, stop, step) {
    let data = Array.from(
      { length: (stop - start) / step + 1 },
      (_, i) => start + i * step,
    );
    return data;
  }

  /* Remove File From S3 */
  async removeFileFromS3(fileKey: string) {
    //Delete File from S3
    const s3 = new S3();
    await s3
      .deleteObject({
        Bucket: this.configService.get('file.awsDefaultS3Bucket'),
        Key: fileKey,
      })
      .promise();
  }

  /* Get Mime Type By File Name */
  async getMimeTypeByFileName(fileName: string) {
    return mime.lookup(fileName);
  }

  /* Get FileName By FilePath */
  async getFileNameByFilePath(filePath: string) {
    let filePathArray = filePath.split('/');
    filePathArray.reverse();
    return filePathArray[0];
  }

  /* Get Current UTCDateTime */
  async getCurrentUTCDateTime() {
    return moment.utc(new Date()).format('YYYY-MM-DD HH:mm:ss.SSSSSSS');
  }

  /* Get TreeHierarchy From FlatData */
  async getTreeHierarchyFromFlatData(flatData) {
    await flatData.map(async (rec) => {
      rec.id = rec.id + '_' + rec.generation;
      if (rec.childId) {
        rec.childId = rec.childId + '_' + (rec.generation - 1);
      }
      return rec;
    });
    const createDataTree = (results) => {
      const hashTable = Object.create(null);
      results.forEach(
        (aData) => (hashTable[aData.id] = { ...aData, children: [] }),
      );
      const dataTree = [];
      results.forEach((aData) => {
        if (aData.childId) {
          const isExist = hashTable[aData.childId].children.some(
            (el) => el.id === aData.id,
          );
          if (!isExist)
            hashTable[aData.childId].children.push(hashTable[aData.id]);
        } else {
          dataTree.push(hashTable[aData.id]);
        }
      });
      return dataTree;
    };
    return createDataTree(flatData);
  }

  /* Get Setting Data Calc Method */
  async getSettingDataCalcMethod(selectedItem = null) {
    let data = [
      {
        id: 1,
        name: 'Country of Race',
        selected: false,
      },
      {
        id: 2,
        name: 'Country of Birth',
        selected: false,
      },
    ];
    if (selectedItem) {
      data.forEach(async (item) => {
        if (item.id == selectedItem) {
          item.selected = true;
        }
      });
    }
    return data;
  }

  /* Get Portal Login Attempt Limits */
  async getPortalLoginAttemptLimits(selectedItem = null) {
    let data = [
      {
        id: 3,
        name: 3,
        selected: false,
      },
      {
        id: 4,
        name: 4,
        selected: false,
      },
      {
        id: 5,
        name: 5,
        selected: false,
      },
    ];
    if (selectedItem) {
      data.forEach(async (item) => {
        if (item.id == selectedItem) {
          item.selected = true;
        }
      });
    }
    return data;
  }

  /* Get Account Suspension Length Limits InHrs */
  async getAccountSuspensionLengthLimitsInHrs(selectedItem = null) {
    let data = [
      {
        id: 6,
        name: 6,
        selected: false,
      },
      {
        id: 12,
        name: 12,
        selected: false,
      },
      {
        id: 24,
        name: 24,
        selected: false,
      },
      {
        id: 48,
        name: 48,
        selected: false,
      },
    ];
    if (selectedItem) {
      data.forEach(async (item) => {
        if (item.id == selectedItem) {
          item.selected = true;
        }
      });
    }
    return data;
  }

  /* Get Active SessionLength Limits InHrs */
  async getActiveSessionLengthLimitsInHrs(selectedItem = null) {
    let data = [
      {
        id: 6,
        name: 6,
        selected: false,
      },
      {
        id: 12,
        name: 12,
        selected: false,
      },
      {
        id: 24,
        name: 24,
        selected: false,
      },
      {
        id: 48,
        name: 48,
        selected: false,
      },
    ];
    if (selectedItem) {
      data.forEach(async (item) => {
        if (item.id == selectedItem) {
          item.selected = true;
        }
      });
    }
    return data;
  }

  /* String to PascalCase */
  toPascalCase(str) {
    if (!str) return str;
    return str
      .match(/\w\S*/g)
      .map((x) => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())
      .join(' ');
  }

  /* String to TitleCase */
  async toTitleCase(str) {
    // if (!str || str === 'undefined' || str === undefined){ return str; }
    // return str
    //   .toLowerCase()
    //   .split(' ')
    //   .map(function (word) {
    //     return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    //   })
    //   .join(' ');
    if (typeof str !== 'string' || !str.trim()) { 
      return str; 
    }
    return str
      .toLowerCase()
      .split(' ')
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  /* Array To Chunks */
  async arrayToChunks(inputArr, noOfChunks) {
    let result = [];
    for (let i = 0; i < inputArr.length; i += noOfChunks) {
      result.push(inputArr.slice(i, i + noOfChunks));
    }
    return result;
  }

  /* Sort By Property */
  async sortByProperty(property) {
    return function (a, b) {
      if (a[property] > b[property]) return 1;
      else if (a[property] < b[property]) return -1;
      return 0;
    };
  }

  /* Common AncestorsList To Chunks */
  async commonAncestorsListToChunks(inputArr, noOfChunks, noOfFirstChunks) {
    let result = [];
    let chunks = noOfFirstChunks;
    for (let i = 0; i < inputArr.length; i += chunks) {
      if (i === 0) {
        result.push(inputArr.slice(i, i + chunks));
      } else {
        chunks = noOfChunks;
        result.push(inputArr.slice(i, i + chunks));
      }
    }
    return result;
  }

  async setToMidNight(date) {
    date = new Date(date);
    date.setHours(23, 59, 59, 999);
    return date;
  }

  async setHoursZero(date) {
    date = new Date(date);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  /*Add weeks to date */
  async addWeeksToDate(dateObj, numberOfWeeks) {
    await dateObj.setDate(dateObj.getDate() + numberOfWeeks * 6);
    return dateObj;
  }

  async dateFormate(date) {
    if (!date) return '';
    var month = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    let dateArr = date.toLocaleDateString('en-us').split('/');
    return (
      dateArr[1] + ' ' + month[parseInt(dateArr[0]) - 1] + ', ' + dateArr[2]
    );
  }

  async parseDateAsDotFormat(dateToParse: string) {
    let parsedDate = new Date(dateToParse);
    const formattedDate = `${parsedDate
      .getDate()
      .toString()
      .padStart(2, '0')}.${(parsedDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${parsedDate.getFullYear()}`;
    return formattedDate;
  }
  /* Add Commas - Pricing */
  async insertCommas(fee: any) {
    if (fee) {
      let tempFee = fee.toString();

      let nStr = tempFee + '';
      var x = nStr.split('.');
      var x1 = x[0];
      var x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
    }
    return fee;
  }

  getYearFromDate(dateString) {
    const date = new Date(dateString);
    return date.getFullYear();
  }

  getMonthFromDate(dateString) {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const date = new Date(dateString);
    return monthNames[date.getMonth()];
  }

  getDayFromDate(dateString) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const date = new Date(dateString);
    const dayOfWeek = dayNames[date.getDay()];
    return dayOfWeek;
  }

  /* Get CountryStates From Filter - Stallion List */
  async getCountryStatesFromFilter(inputData) {
    let countryStatesList = [];
    inputData.map((record: any) => {
      if (!countryStatesList[record.countryId]) {
        countryStatesList[record.countryId] = {
          countryId: record.countryId,
          label: record.countryName,
          countryCode: record.countryCode,
          countryA2Code: record.countryA2Code,
          children: [],
        };
      }
      if (record.stateId) {
        let state = {
          countryId: record.countryId,
          stateId: record.stateId,
          label: record.stateName,
        };
        let statesCheck = countryStatesList[record.countryId].children.filter(
          function (item) {
            return item.stateId === state.stateId;
          },
        );
        if (!statesCheck.length)
          countryStatesList[record.countryId].children.push(state);
      }
    });

    countryStatesList.map(function name(record) {
      record.children.sort((a, b) => a.label.localeCompare(b.label));
      record.children.filter(function (item) {
        return item !== null;
      });
    });
    countryStatesList.sort((a, b) => a.label.localeCompare(b.label));
    let finalCountryStatesList = countryStatesList.filter(function (item) {
      return item != null;
    });
    return finalCountryStatesList;
  }

  //Compare Key - Value in the Array of Array of Objects
  compareKeyInArrayOfArrays(arr, searchKey: string, searchString: string): boolean {
    for (const subArray of arr) {
      for (const obj of subArray) {
        if (obj[searchKey] === searchString) {
          return obj; // The key value matches the search string
        }
      }
    }
    return null; // The key value was not found
  }

  //Compare Key - StartsWith in the Array of Array of Objects
  compareKeyAndValueStartsWithInArrayOfArrays(arr, searchKey: string, searchString: string): boolean {
    for (const subArray of arr) {
      for (const obj of subArray) {
        if (obj[searchKey].startsWith(searchString) && (obj[searchKey].length === (searchString.length + 1))) {
          return obj; // The key value matches the search string
        }
      }
    }
    return null; // The key value was not found
  }

  //Find And Replace Object in Array of Arrays
  findAndReplaceObject(arrayOfArrays: any[][], targetObject: any, replacementObject: any): void {
    // Iterate through the outer array
    for (let i = 0; i < arrayOfArrays.length; i++) {
      const innerArray = arrayOfArrays[i];
      
      // Find the index of the targetObject within the inner array
      const index = innerArray.findIndex((obj) => obj === targetObject);
  
      // If the targetObject is found in the inner array, replace it with the replacementObject
      if (index !== -1) {
        innerArray[index] = replacementObject;
        return; // Stop searching after replacement
      }
    }
  }
  async getReportCoverImage(productCode){
    return PRODUCTCOVERIMAGE[productCode];
  }
}
