import {
  HttpStatus,
  Inject,
  Injectable,
  UnprocessableEntityException,
  UploadedFile,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Horse } from 'src/horses/entities/horse.entity';
import { HorsesService } from 'src/horses/horses.service';
import { SalesLotInfoTemp } from 'src/sales-lot-info-temp/entities/sale-lot-info-temp.entity';
import { SalesReportsetting } from 'src/sales-report-settings/entities/sales-report-settings.entity';
import { Sales } from 'src/sales/entities/sales.entity';
import { getCSVFile } from 'src/utils/file-uploading.utils';
import { Brackets, Repository, UpdateResult, getRepository } from 'typeorm';
import { UpdateLotSettingsDto } from './dto/save-setting.dto';
import { SearchOptionsDto } from './dto/search-options.dto';
import { UpdateLotDto } from './dto/update-lot.dto';
import { SalesLot } from './entities/sales-lots.entity';
import { SalesLotDto } from './dto/sales-lot.dto';
import { Currency } from 'src/currencies/entities/currency.entity';
import { SALES_STATUS } from 'src/utils/constants/common';
var fs = require('fs');
const csv = require('csv-parser');

@Injectable()
export class SalesLotsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(SalesLot)
    private saleslotsRepository: Repository<SalesLot>,
    private horseService: HorsesService,
  ) {}
  /* 'Get All Sales-Lots */
  async findDetails(searchOptionsDto: SearchOptionsDto) {
    let sale = await getRepository(Sales)
      .createQueryBuilder('sales')
      .select('sales.Id')
      .andWhere('sales.salesUuid =:salesUuid', {
        salesUuid: searchOptionsDto.saleId,
      })
      .getRawOne();
    const queryBuilder = await this.saleslotsRepository
      .createQueryBuilder('sales')
      .select(
        'sales.id ,sales.salesLotUuid,sales.salesId,sales.isVerified as isVerified,isWithdrawn,sales.lotNumber as lotNumber',
      )
      .addSelect(
        'salesLotInfoTemp.sireId, salesLotInfoTemp.sireName,salesLotInfoTemp.sireCob,salesLotInfoTemp.sireYob',
      )
      .addSelect(
        'salesLotInfoTemp.damId, salesLotInfoTemp.damName,salesLotInfoTemp.damCob,salesLotInfoTemp.damYob',
      )
      .addSelect(
        'salesLotInfoTemp.horseName as horseName,salesLotInfoTemp.salesLotInfoUuid as salesLotInfoUuid',
      )
      .innerJoin('sales.salesLotInfoTemp', 'salesLotInfoTemp');

    if (searchOptionsDto.isVerified == true) {
      queryBuilder.andWhere('sales.isVerified = :isVerified', {
        isVerified: searchOptionsDto.isVerified,
      });
    }
    if (searchOptionsDto.isVerified == false) {
      queryBuilder.andWhere(
        new Brackets((subQ) => {
          subQ
            .where('sales.isVerified = :isVerified', { isVerified: 0 })
            .orWhere('sales.isVerified IS NULL');
        }),
      );
    }
    if (searchOptionsDto.isWithdrawn) {
      queryBuilder.andWhere('sales.isWithdrawn =:isWithdrawn', {
        isWithdrawn: searchOptionsDto.isWithdrawn,
      });
    }

    if (searchOptionsDto.lotRange) {
      const lotsStart = searchOptionsDto.lotRange;
      let lots = lotsStart.split('-');
      if (lots.length === 2) {
        let minValue = lots[0];
        let maxValue = lots[1];
        queryBuilder.andWhere(
          ' sales.Id >= :minValue AND sales.Id <= :maxValue ',
          {
            minValue,
            maxValue,
          },
        );
      }
    }
    queryBuilder.andWhere('sales.salesId =:salesId', {
      salesId: sale.sales_Id,
    });
    const entities = queryBuilder.getRawMany();
    return entities;
  }
  /* Upload CSV file and inserting list records into database */
  // async uploadFile(saleId: string, @UploadedFile() file: Express.Multer.File) {
  //   const sale = await this.findOne(saleId);
  //   if (!sale) {
  //     throw new UnprocessableEntityException('Sale not exist!');
  //   }
  //   const member = this.request.user;
  //   await getRepository(Sales).update(
  //     { salesUuid: saleId },
  //     { statusId: 2, modifiedBy: member['id'] },
  //   );
  //   const csvPath = getCSVFile();
  //   const filePath = csvPath + this.request.file.filename;
  //   const results = [];
  //   await fs
  //     .createReadStream(filePath)
  //     .pipe(csv())
  //     .on('data', async (data) => {
  //       const keys = Object.keys(data);
  //       results.push(data);
  //     })
  //     .on('end', async () => {
  //       const newArr = results.map((v) => ({ ...v, salesId: sale.Id }));
  //       for (let obj of newArr) {
  //         var horseInfo = {
  //           horseName: obj.horseName,
  //           horseGender: obj.horseGender,
  //           horseYob: obj.horseYoB,
  //           horseFoaledDate: obj.horseFoaledDate,
  //           horseCob: obj.horseCoB,
  //           horseColour: obj.horseColour,
  //           sireName: obj.sireName,
  //           sireCob: obj.sireCoB,
  //           sireYob: obj.sireYoB,
  //           sireColour: obj.sireColour,
  //           sireSireCob: obj.sireSireCoB,
  //           sireSireYob: obj.sireSireYoB,
  //           damSireCob: obj.damSireCoB,
  //           damSireYob: obj.damSireYoB,
  //           damCob: obj.damCoB,
  //           damYob: obj.damYoB,
  //         };
  //         let element = { ...obj, ...horseInfo };

  //         let findCriterion = {
  //           salesId: element.salesId,
  //           lotNumber: element.lotNumber,
  //           lotCode: element.lotCode,
  //         };
  //         let recordExist = await this.saleslotsRepository.findOne(
  //           findCriterion,
  //         );
  //         if (recordExist) {
  //           const isWithdrawn = element.isWithdrawn == 1 ? true : false;
  //           const updateResult: UpdateResult =
  //             await this.saleslotsRepository.update(findCriterion, {
  //               buyerName: element.buyerName,
  //               buyerLocation: element.buyerLocation,
  //               price: element.price,
  //               isWithdrawn: isWithdrawn,
  //             });
  //         } else {
  //           if (element.horseName) {
  //             let existHorseNamedHorse = await this.findExistingHorse(element);
  //             if (existHorseNamedHorse) {
  //               const dataFromDB = await this.saleslotsRepository.manager.query(
  //                 `EXEC proc_SMPSearchPedigree 
  //                 @Paramid=@0`,
  //                 [existHorseNamedHorse.id],
  //               );
  //               const sireSireData =
  //                 await this.getHorseRecordForPositionFromList(
  //                   dataFromDB,
  //                   'SS',
  //                 );
  //               const damSireData =
  //                 await this.getHorseRecordForPositionFromList(
  //                   dataFromDB,
  //                   'DS',
  //                 );
  //               //need to confirm color field in csv file
  //               element.horseId = existHorseNamedHorse.id;
  //               element.horseColour = existHorseNamedHorse.horseColour;
  //               element.horseColourId = existHorseNamedHorse.horseColourId;
  //               element.horseCobId = existHorseNamedHorse.horseCobId;
  //               element.sireId = existHorseNamedHorse.sireId;
  //               element.sireName = existHorseNamedHorse.sireName;
  //               element.sireYob = existHorseNamedHorse.sireYob;
  //               element.sireCob = existHorseNamedHorse.sireCountryCode;
  //               element.damId = existHorseNamedHorse.damId;
  //               element.damName = existHorseNamedHorse.damName;
  //               element.damYob = existHorseNamedHorse.damYob;
  //               element.damCob = existHorseNamedHorse.damCountryCode;
  //               if (sireSireData) {
  //                 element.sireSireName = sireSireData.horseName;
  //                 element.sireSireId = sireSireData.sireId;
  //                 element.sireSireCob = sireSireData.cob;
  //                 element.sireSireYob = sireSireData.yob;
  //               }
  //               if (damSireData) {
  //                 element.damSireName = damSireData.horseName;
  //                 element.damSireId = damSireData.damId;
  //                 element.damSireCob = damSireData.cob;
  //                 element.damSireYob = damSireData.yob;
  //               }
  //               element.notMatchedLot = false;
  //               element.isNamed = true;
  //             } else {
  //               element.notMatchedLot = true;
  //               element.isNamed = true;
  //             }

  //             let lot = await SalesLot.save(element);
  //             element.salesLotId = lot.Id;
  //             SalesLotInfoTemp.save(element);
  //           } else {
  //             element.isNamed = 0;
  //             element.notMatchedLot = false;
  //             element.horseName = sale.salesCode + '_' + element.lotNumber;
  //             let findSireObj = {
  //               sireName: element.sireName,
  //               isSireNameExactSearch: true,
  //             };
  //             if (element.sireCoB) {
  //               //     if(element.sireCob !== null || element.sireCob !== " " || element.sireCob !== '' || element.sireCob !== ' '){
  //               findSireObj['sireCob'] = element.sireCob;
  //             }
  //             if (element.sireYob) {
  //               // if(element.sireYob !== null || element.sireYob !== " "  || element.sireYob !== '' || element.sireYob !== ' '){
  //               findSireObj['yob'] = element.sireYob;
  //             }
  //             let findDamObj = {
  //               damName: element.damName,
  //               isDamNameExactSearch: true,
  //             };
  //             if (element.damCob) {
  //               //   if(element.damCob !== null || element.damCob !== " " || element.damCob !== '' || element.damCob !== ' '){
  //               findDamObj['damCob'] = element.damCob;
  //             }
  //             if (element.damYob) {
  //               //    if(element.damYob !== null || element.damYob !== " " || element.damYob !== '' || element.damYob !== ' '){
  //               findDamObj['yob'] = element.sireYob;
  //             }

  //             let sire: any = await this.horseService.findSiresByName(
  //               findSireObj,
  //             );
  //             let dam: any = await this.horseService.findDamsByName(findDamObj);
  //             if (sire) {
  //               (element.sireId = sire[0].id),
  //                 (element.sireYob = sire[0].yob),
  //                 (element.sireCob = sire[0].countryCode),
  //                 (element.sireColour = sire[0].colourName),
  //                 (element.sireSireName = sire[0].sireName),
  //                 (element.sireSireId = sire[0].sirePedigreeId),
  //                 (element.sireSireCob = sire[0].sirecountry),
  //                 (element.sireSireColour = sire[0].sireColourName),
  //                 (element.sireSireYob = sire[0].sireyob);
  //             }
  //             if (dam) {
  //               (element.damId = dam[0].id),
  //                 (element.damYob = dam[0].yob),
  //                 (element.damCob = dam[0].countryCode),
  //                 (element.damColour = dam[0].colourName),
  //                 (element.damSireName = dam[0].sireName),
  //                 (element.damSireId = dam[0].sirePedigreeId),
  //                 (element.damSireCob = dam[0].sirecountry),
  //                 (element.damSireColour = dam[0].sireColourName),
  //                 (element.damSireYob = dam[0].sireyob);
  //             }
  //             if (sire && dam) {
  //               element.notMatchedSireDam = false;
  //             } else {
  //               element.notMatchedSireDam = true;
  //             }
  //             let lot = await SalesLot.save(element);
  //             element.salesLotId = lot.Id;
  //             SalesLotInfoTemp.save(element);
  //           }
  //         }
  //       }
  //     });

  //   const response = {
  //     message: 'File uploaded successfully!',
  //     data: {
  //       originalname: file.originalname,
  //       filename: file.filename,
  //       uploading_date: new Date(),
  //     },
  //   };

  //   return response;
  // }
  async findlot(element) {
    const lot = await this.saleslotsRepository.findOne({
      salesId: element.salesId,
      lotCode: element.lotCode,
      lotNumber: element.lotNumber,
    });
    return lot;
  }

  async uploadFile(saleId: string, @UploadedFile() file: Express.Multer.File) {
   try {
    // Check if the file is a CSV file
   
    if (!file.mimetype.includes('csv') || !file.originalname.toLowerCase().endsWith('.csv')) {
      throw new UnprocessableEntityException('Invalid file type. Only CSV files are allowed.');
    }
     const sale = await this.findOne(saleId);
      if (!sale) {
        throw new UnprocessableEntityException('Sale does not exist!');
      }

      const member = this.request.user;
      const csvPath = getCSVFile();
      const filePath = csvPath + this.request.file.filename;
      const results = await this.parseCSV(filePath);
        
      // Check if the CSV file has correct headers
      if (!this.hasCorrectHeaders(results)) {
        throw new UnprocessableEntityException('CSV file does not have correct headers.');
      }
      await this.processData(results, sale);
      await getRepository(Sales).update(
        { salesUuid: saleId },
        { statusId: SALES_STATUS.VERIFY_REQUIRED, modifiedBy: member['id'] },
      );
      const response = {
        message: 'File uploaded successfully!',
        data: {
          originalname: file.originalname,
          filename: file.filename,
          uploading_date: new Date(),
        },
      };

      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // Function to check if the CSV file has correct headers
  private hasCorrectHeaders(data: any[]): boolean {
    const expectedHeaders = ["bookNumber","dayNumber","lotCode","lotNumber","lotType","horseName","horseGender","horseYoB","horseFoaledDate","horseCoB","horseColour","sireName","sireYoB","sireCoB","sireColour","damName","damYoB","damCoB","damColour","sireSireName","sireSireYoB","sireSireCoB","sireSireColour","damSireName","damSireYoB","damSireCoB","damSireColour","venderName","buyerName","buyerLocation","coveringStallionName","price","priceCurrency","isWithdrawn"
    ];
      const csvHeaders = Object.keys(data[0] || {});  
      return expectedHeaders.every(expectedHeader => csvHeaders.includes(expectedHeader));
    }
    
  async parseCSV(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async processData(results: any[], sale: any) {
    const newArr = results.map((v) => ({ ...v, salesId: sale.Id }));

    for (let obj of newArr) {
      //  processing logic here
      var horseInfo = {
        horseName: obj.horseName,
        horseGender: obj.horseGender,
        horseYob: obj.horseYoB,
        horseFoaledDate: obj.horseFoaledDate,
        horseCob: obj.horseCoB,
        horseColour: obj.horseColour,
        sireName: obj.sireName,
        sireCob: obj.sireCoB,
        sireYob: obj.sireYoB,
        sireColour: obj.sireColour,
        sireSireCob: obj.sireSireCoB,
        sireSireYob: obj.sireSireYoB,
        damSireCob: obj.damSireCoB,
        damSireYob: obj.damSireYoB,
        damCob: obj.damCoB,
        damYob: obj.damYoB,
      };
      let element = { ...obj, ...horseInfo };

      let findCriterion = {
        salesId: element.salesId,
        lotNumber: element.lotNumber,
        lotCode: element.lotCode,
      };
      let recordExist = await this.saleslotsRepository.findOne(
        findCriterion,
      );
      const  priceCurrency = await getRepository(Currency).findOne({currencyCode: element.priceCurrency})
      if (recordExist) {
        const isWithdrawn = element.isWithdrawn == 1 ? true : false;
        const updateResult: UpdateResult =
          await this.saleslotsRepository.update(findCriterion, {
            buyerName: element.buyerName,
            buyerLocation: element.buyerLocation,
            price: element.price,
            isWithdrawn: isWithdrawn,
            priceCurrencyId:priceCurrency?.id
          });
      } else {
        if (element.horseName) {
          let existHorseNamedHorse = await this.findExistingHorse(element);
          if (existHorseNamedHorse) {
            const dataFromDB = await this.saleslotsRepository.manager.query(
              `EXEC proc_SMPSearchPedigree 
              @Paramid=@0`,
              [existHorseNamedHorse.id],
            );
            const sireSireData =
              await this.getHorseRecordForPositionFromList(
                dataFromDB,
                'SS',
              );
            const damSireData =
              await this.getHorseRecordForPositionFromList(
                dataFromDB,
                'DS',
              );
            //need to confirm color field in csv file
            element.horseId = existHorseNamedHorse.id;
            element.horseColour = existHorseNamedHorse.horseColour;
            element.horseColourId = existHorseNamedHorse.horseColourId;
            element.horseCobId = existHorseNamedHorse.horseCobId;
            element.sireId = existHorseNamedHorse.sireId;
            element.sireName = existHorseNamedHorse.sireName;
            element.sireYob = existHorseNamedHorse.sireYob;
            element.sireCob = existHorseNamedHorse.sireCountryCode;
            element.damId = existHorseNamedHorse.damId;
            element.damName = existHorseNamedHorse.damName;
            element.damYob = existHorseNamedHorse.damYob;
            element.damCob = existHorseNamedHorse.damCountryCode;
            if (sireSireData) {
              element.sireSireName = sireSireData.horseName;
              element.sireSireId = sireSireData.sireId;
              element.sireSireCob = sireSireData.cob;
              element.sireSireYob = sireSireData.yob;
            }
            if (damSireData) {
              element.damSireName = damSireData.horseName;
              element.damSireId = damSireData.damId;
              element.damSireCob = damSireData.cob;
              element.damSireYob = damSireData.yob;
            }
            element.notMatchedLot = false;
            element.isNamed = true;
          } else {
            element.notMatchedLot = true;
            element.isNamed = true;
          }
          element.buyerName,
          element.buyerLocation,
          element.price,
          element.priceCurrencyId = priceCurrency?.id
          let lot = await SalesLot.save(element);
          element.salesLotId = lot.Id;
          SalesLotInfoTemp.save(element);
        } else {
          element.buyerName,
          element.buyerLocation,
          element.price,
          element.priceCurrencyId = priceCurrency?.id
          element.isNamed = 0;
          element.notMatchedLot = false;
          element.horseName = sale.salesCode + '_' + element.lotNumber;
          let findSireObj = {
            sireName: element.sireName,
            isSireNameExactSearch: true,
            yob:element.sireYob

          };
          if (element.sireCoB) {
            //     if(element.sireCob !== null || element.sireCob !== " " || element.sireCob !== '' || element.sireCob !== ' '){
            findSireObj['sireCob'] = element.sireCob;
          }
          if (element.sireYob) {
            // if(element.sireYob !== null || element.sireYob !== " "  || element.sireYob !== '' || element.sireYob !== ' '){
            findSireObj['yob'] = element.sireYob;
          }
          let findDamObj = {
            damName: element.damName,
            isDamNameExactSearch: true,
            yob:element.damYob
          };
          if (element.damCob) {
            //   if(element.damCob !== null || element.damCob !== " " || element.damCob !== '' || element.damCob !== ' '){
            findDamObj['damCob'] = element.damCob;
          }
          if (element.damYob) {
            //    if(element.damYob !== null || element.damYob !== " " || element.damYob !== '' || element.damYob !== ' '){
            findDamObj['yob'] = element.sireYob;
          }

          let sire: any = await this.findSiresByName(
            findSireObj,
          );
          let dam: any = await this.findDamsByName(findDamObj);
          if (sire) {
            (element.sireId = sire[0].id),
              (element.sireYob = sire[0].yob),
              (element.sireCob = sire[0].countryCode),
              (element.sireColour = sire[0].colourName),
              (element.sireSireName = sire[0].sireName),
              (element.sireSireId = sire[0].sirePedigreeId),
              (element.sireSireCob = sire[0].sirecountry),
              (element.sireSireColour = sire[0].sireColourName),
              (element.sireSireYob = sire[0].sireyob);
          }
          if (dam) {
            (element.damId = dam[0].id),
              (element.damYob = dam[0].yob),
              (element.damCob = dam[0].countryCode),
              (element.damColour = dam[0].colourName),
              (element.damSireName = dam[0].sireName),
              (element.damSireId = dam[0].sirePedigreeId),
              (element.damSireCob = dam[0].sirecountry),
              (element.damSireColour = dam[0].sireColourName),
              (element.damSireYob = dam[0].sireyob);
          }
          if (sire && dam) {
            element.notMatchedSireDam = false;
          } else {
            element.notMatchedSireDam = true;
          }
          let lot = await SalesLot.save(element);
          element.salesLotId = lot.Id;
          SalesLotInfoTemp.save(element);
        }
      }
    }
  }

  
  async findSiresByName(obj) {
    let sire = await getRepository(Horse)
      .createQueryBuilder('horse')
      .select('horse.id as id, horse.horseName as sireName')
      .where('horse.horseName = :sireName AND horse.yob = :yob AND horse.sex = :sex', {
        sireName: obj.sireName,
        yob: obj.sireYob,
        sex: 'M', 
      })
      .getRawOne();
    return sire;
  }

  async findDamsByName(obj) {
    let sire = await getRepository(Horse)
      .createQueryBuilder('horse')
      .select('horse.id as id, horse.horseName as damName')
      .where('horse.horseName = :damName AND horse.yob = :yob AND horse.sex = :sex', {
        damName: obj.damName,
        yob: obj.damYob,
        sex: 'F', 
      })
      .getRawOne();
    return sire;
  }

  async findOne(saleId) {
    let sale = await getRepository(Sales)
      .createQueryBuilder('sales')
      .select('sales.Id as Id,sales.salesCode as salesCode')
      .andWhere('sales.salesUuid =:salesUuid', { salesUuid: saleId })
      .getRawOne();
    return sale;
  }

  /* Get Lot details */
  async findLotDetails(id) {
    let lot = await getRepository(SalesLot)
      .createQueryBuilder('lot')
      .select(
        'lot.Id as Id,lot.isNamed as isNamed ,lot.isWithdrawn,lot.isVerified,lot.salesId,lot.verifiedOn,lot.lotNumber as lotNumber',
      )
      .addSelect('salesLotInfoTemp.horseName as horseName,horse.horseUuid')
      .addSelect(
        'salesLotInfoTemp.sireId, salesLotInfoTemp.sireName,salesLotInfoTemp.sireCob,salesLotInfoTemp.sireYob',
      )
      .addSelect(
        'salesLotInfoTemp.damId, salesLotInfoTemp.damName,salesLotInfoTemp.damCob,salesLotInfoTemp.damYob',
      )
      .addSelect(
        'salesType.salesTypeName as salesType'
      )
      .addSelect(
        'lotTypes.salesTypeName as lotType'
      )
      .addSelect(
        'currency.currencyCode as currency'
      )
      .addSelect('member.email as verifiedBy')
      .leftJoin('lot.salesLotInfoTemp', 'salesLotInfoTemp')
      .leftJoin('lot.horse', 'horse')
      .leftJoin('lot.member','member')
      .leftJoin('lot.sales','sales')
      .leftJoin('sales.salesType','salesType')
      .leftJoin('lot.lotTypes','lotTypes')
      .leftJoin('lot.currency','currency')
      .andWhere('lot.salesLotUuid =:id', { id: id })
      .getRawOne();
    return lot;
  }

  async findExistingHorse(data) {
    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireCountry.countryCode as sireCountryCode, sireHorse.yob as sireYob, sireHorse.horseName as sireName, sireHorse.horseUuid as sireId, sireHorse.id as sireProgenyId',
      )
      .innerJoin('sireHorse.nationality', 'sireCountry')
      .andWhere('sireHorse.horseName IS NOT NULL');

    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select(
        'damCountry.countryCode as damCountryCode, damHorse.yob as damYob, damHorse.horseName as damName, damHorse.horseUuid as damId, damHorse.id as damProgenyId',
      )
      .innerJoin('damHorse.nationality', 'damCountry')
      .andWhere('damHorse.horseName IS NOT NULL');

    let existHorse = await getRepository(Horse)
      .createQueryBuilder('horse')
      .select(
        'horse.horseName,horse.id,horse.yob,horse.horseUuid as horseUuid,colour.colourName as horseColour,colour.id as horseColourId',
      )
      .addSelect(
        'sire.sireProgenyId as sireId, sire.sireName, sire.sireYob, sire.sireCountryCode',
      )
      .addSelect(
        'dam.damProgenyId as damId,dam.damName, dam.damYob, dam.damCountryCode',
      )
      .addSelect(' country.countryCode as countryCode,country.id as horseCobId')
      .innerJoin('horse.nationality', 'country')
      .innerJoin('horse.colour', 'colour')
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sireProgenyId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horse.damId',
      );
    if (data.horseName) {
      existHorse.andWhere(
        'horse.horseName =:horseName AND horse.yob =:yob AND country.countryCode =:countryCode  AND sire.sireName =:sireName AND dam.damName =:damName',
        {
          horseName: data.horseName,
          yob: data.horseYoB,
          countryCode: data.horseCoB,
          sireName: data.sireName,
          damName: data.damName,
        },
      );
    }

    const entities = await existHorse.getRawOne();
    return entities;
  }

  /* Verify Lot */
  async update(id, data: UpdateLotDto) {
    let lot = await this.findLotDetails(id);
    const horseId  = await getRepository(Horse).findOne({
      horseUuid: data.horseId,
    });
    const sireId  = await getRepository(Horse).findOne({
      horseUuid: data.sireId,
    });
    const damId  = await getRepository(Horse).findOne({
      horseUuid: data.damId,
    });
    const sireSireId  = await getRepository(Horse).findOne({
      horseUuid: data.sireSireId,
    });
    const damSireId  = await getRepository(Horse).findOne({
      horseUuid: data.damSireId,
    });
   
    let totalLots = await getRepository(SalesLot).find({
      salesId: lot.salesId,
    });

    if (!lot) {
      throw new UnprocessableEntityException('Lot not exist!');
    }
    const member = this.request.user;
    let horse = await getRepository(Horse).findOne({
      horseUuid: data.horseId,
    });
    data.verifiedBy = member['id'];
    data.verifiedOn = new Date();
    const updateResult: UpdateResult = await this.saleslotsRepository.update(
      { salesLotUuid: id },
      {
        isVerified: data.isVerified,
        horseId: horse.id,
        verifiedBy: member['id'],
        verifiedOn: data.verifiedOn,
        lotType:data.lotType,
        isNamed:data.isNamed
      },
    );
    if (updateResult.affected > 0) {
      delete data.isVerified;
      delete data.verifiedBy;
      delete data.verifiedOn;
      delete data.horseId;
      delete data.sireId;
      delete data.damId;
      delete data.damSireId;
      delete data.sireSireId;
      delete data.lotType;
      delete data.isNamed
      const newData = {
        ...data,
        horseId :horse.id,
        sireId:sireId.id,
        damId:damId.id,
        sireSireId:sireSireId.id,
        damSireId:damSireId.id,
      }

      const updateResult: UpdateResult = await getRepository(
        SalesLotInfoTemp,
      ).update({ salesLotId: lot.Id }, newData );
    }
    let totalVerifyLots = await getRepository(SalesLot).find({
      salesId: lot.salesId,
      isVerified: true,
    });
    if (totalLots.length == totalVerifyLots.length) {
      const updateResult: UpdateResult = await getRepository(Sales).update(
        { Id: lot.salesId },
        { statusId: SALES_STATUS.READY_TO_DEPLOY },
      );
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Lot updated successfully',
    };
  }
  /* Download Sales-Lots  */
  async download(id) {
    let sale = await getRepository(Sales)
      .createQueryBuilder('sales')
      .select('sales.Id')
      .andWhere('sales.salesUuid =:salesUuid', { salesUuid: id })
      .getRawOne();
    const queryBuilder = await this.saleslotsRepository
      .createQueryBuilder('sales')
      .select(
        'sales.id ,sales.isNamed,sales.bookNumber,sales.dayNumber,sales.lotCode,sales.lotNumber,sales.horseGender,sales.venderName,sales.buyerName,sales.buyerLocation,sales.price,sales.salesId,sales.isVerified as isVerified,isWithdrawn',
      )
      .addSelect(
        'salesLotInfoTemp.sireId, salesLotInfoTemp.sireName,salesLotInfoTemp.sireCob,salesLotInfoTemp.sireYob',
      )
      .addSelect(
        'salesLotInfoTemp.damId, salesLotInfoTemp.damName,salesLotInfoTemp.damCob,salesLotInfoTemp.damYob',
      )
      .addSelect(
        'salesLotInfoTemp.horseName as horseName,salesLotInfoTemp.salesLotInfoUuid as salesLotInfoUuid,salesLotInfoTemp.horseFoaledDate,salesLotInfoTemp.horseCob,salesLotInfoTemp.horseYob,salesLotInfoTemp.horseColour',
      )
      .innerJoin('sales.salesLotInfoTemp', 'salesLotInfoTemp')
      .andWhere('sales.salesId =:salesId', { salesId: sale.sales_Id });

    const entities = queryBuilder.getRawMany();
    return entities;
  }
  /* Search Horse By Id  */
  async findHorse(id) {
    let sireQueryBuilder = getRepository(Horse)
      .createQueryBuilder('sireHorse')
      .select(
        'sireCountry.countryCode as sireCountryCode, sireHorse.yob as sireYob, sireHorse.horseName as sireName, sireHorse.horseUuid as sireId, sireHorse.id as sireProgenyId',
      )
      .innerJoin('sireHorse.nationality', 'sireCountry')
      .andWhere('sireHorse.horseName IS NOT NULL');

    let damQueryBuilder = getRepository(Horse)
      .createQueryBuilder('damHorse')
      .select(
        'damCountry.countryCode as damCountryCode, damHorse.yob as damYob, damHorse.horseName as damName, damHorse.horseUuid as damId, damHorse.id as damProgenyId',
      )
      .innerJoin('damHorse.nationality', 'damCountry')
      .andWhere('damHorse.horseName IS NOT NULL');

    let existHorse = await getRepository(Horse)
      .createQueryBuilder('horse')
      .select('horse.horseName,horse.id')
      .addSelect('sire.sireProgenyId as sireId, sire.sireName')
      .addSelect('dam.damProgenyId as damId,dam.damName')
      //    .addSelect(' country.countryCode as countryCode')
      .innerJoin('horse.nationality', 'country')
      .leftJoin(
        '(' + sireQueryBuilder.getQuery() + ')',
        'sire',
        'sireProgenyId=horse.sireId',
      )
      .leftJoin(
        '(' + damQueryBuilder.getQuery() + ')',
        'dam',
        'damProgenyId=horse.damId',
      )
      .andWhere('horse.horseUuid = :horseUuid', { horseUuid: id })
      .getRawOne();

    return existHorse;
  }

  /* Get Lot Drop-down list */
  async findLotList(salesId) {
    let sale = await this.findOne(salesId);
    let lot = await getRepository(SalesLot)
      .createQueryBuilder('lot')
      .select('lot.Id as Id,lot.isVerified')
      .addSelect('salesLotInfoTemp.horseName as horseName')
      .innerJoin('lot.salesLotInfoTemp', 'salesLotInfoTemp')
      .leftJoin('lot.horse', 'horse')
      .andWhere('lot.isVerified =:isVerified', { isVerified: 1 })
      .andWhere('lot.salesId =:salesId', { salesId: sale.Id })
      .getRawMany();
    return lot;
  }
  /* Generate report pop-up */
  async create(salesId, createDto: UpdateLotSettingsDto) {
    let sale = await this.findOne(salesId);
    let lotsArray = createDto.selectedLots;
    if (lotsArray) {
      lotsArray.forEach((element) => {
        this.saleslotsRepository.update(element, {
          isSelectedForSetting: true,
        });
      });
    }
    delete createDto.isSelectedForSetting;
    createDto['saleId'] = sale.Id;
    const Response = await getRepository(SalesReportsetting).save(
      await getRepository(SalesReportsetting).create(createDto),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Created successfully',
    };
  }

  /* Get Horse Record For Position From List*/
  async getHorseRecordForPositionFromList(dataList, position) {
    let record = dataList.filter((res: any) => res.tag === position);
    if (record.length) {
      return record[0];
    }
    return false;
  }

  
  /*  Get All Sales Lot List By Selected Sales */
  async findBySales(sales: string) {
    const queryBuilder = this.saleslotsRepository
      .createQueryBuilder('saleslot')
      .select('saleslot.id as salesLotId, saleslot.horseGender as gender')
      .andWhere('saleslot.isVerified=1')
      let salesList = sales.split(',');
    if (salesList.length > 0) {
      queryBuilder.andWhere('saleslot.salesId IN (:...salesIds)', {
        salesIds: salesList,
      });
    }
    const entities = await queryBuilder.getRawMany();
    return entities;
  }
}
