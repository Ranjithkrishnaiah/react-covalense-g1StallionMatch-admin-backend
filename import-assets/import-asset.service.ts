import {
  Injectable,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Workbook } from 'exceljs';
import { FarmsService } from 'src/farms/farms.service';
import { StallionsService } from 'src/stallions/stallions.service';
import { ConfigService } from '@nestjs/config';
import { S3Client, CopyObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from 'aws-sdk';
import { MediaService } from 'src/media/media.service';

@Injectable({ scope: Scope.REQUEST })
export class ImportAssetService {
  constructor(
    private farmService: FarmsService,
    private stallionService: StallionsService,
    private mediaService: MediaService,
    private readonly configService: ConfigService,
  ) {}

  //Strean xlsx file
  async streamFile() {
    const s3 = new S3();
    let params = {
      Bucket: this.configService.get('file.assetBulkUploadBucket'),
      Key: 'Assets/SMP-ImagesDetails.xlsx',
    };
    return s3.getObject(params).createReadStream();
  }

  //Start Migration
  async doMigration() {
    const farmAsset = 'Assets/Farm Asset/';
    const stallionAsset = 'Assets/Stallion Asset/';
    let workBook = new Workbook();
    await this.validateData(
      workBook,
      await this.streamFile(),
      farmAsset,
      stallionAsset,
    );
    await this.startProcess(
      workBook,
      await this.streamFile(),
      farmAsset,
      stallionAsset,
    );
  }

  /*
   * Validate Columns
   */
  async validateData(workBook, stream, farmAsset, stallionAsset) {
    let errors = [];
    await workBook.xlsx
      .read(stream)
      .then(async () => {
        const sheetData = await workBook.getWorksheet('List');
        // let self = this
        await sheetData.eachRow(async function (row, rowNumber) {
          let rowData = await row.values;
          if ((await rowData.length) !== 6) {
            throw new UnprocessableEntityException('Columns count - Mismatch');
          }
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
    return errors;
  }

  //Start Process of Migration
  async startProcess(workBook, stream, farmAsset, stallionAsset) {
    workBook.xlsx
      .read(stream)
      .then(() => {
        const sheetData = workBook.getWorksheet('List');
        let self = this;
        sheetData.eachRow(async function (row, rowNumber) {
          if (rowNumber > 1) {
            //[null,82,"7_All_Too_Hard.jpg","NULL","NULL","-","Profile",7]
            //[null,22,"478_Farm_Linton_Grange.png",478,null,"-","Logo","NULL","NULL"]
            let rowData = row.values;
            let imgName = rowData[2].replace(/'/g, '_');
            //farmId
            if (Number.isInteger(rowData[3])) {
              let farmId = rowData[3];
              let fileName = imgName;
              let imagePath = farmAsset + fileName;
              if (rowData[4].toLowerCase() == 'logo') {
                let fileuuid = uuidv4();
                let record = await self.farmService.findById(farmId);
                if (record) {
                  let fileKey = await self.getFileKey(
                    'farm',
                    rowData[4],
                    fileuuid,
                    imgName,
                  );
                  let mediaRecord = await self.farmService.setFarmProfilePic(
                    record,
                    fileuuid,
                  );
                  if (mediaRecord) {
                    await self.copyFile(
                      fileName,
                      imagePath,
                      fileKey,
                      mediaRecord.mediaId,
                    );
                  }
                }
              }
            }
            //stallionId
            if (Number.isInteger(rowData[5])) {
              let stallionId = rowData[5];
              let fileName = imgName;
              let imagePath = stallionAsset + fileName;
              if (rowData[4].toLowerCase() == 'profile') {
                let fileuuid = uuidv4();
                let record = await self.stallionService.findOneById(stallionId);
                if (record) {
                  let fileKey = await self.getFileKey(
                    'stallion',
                    rowData[4],
                    fileuuid,
                    imgName,
                  );
                  let mediaRecord =
                    await self.stallionService.setStallionProfilePic(
                      record,
                      fileuuid,
                    );
                  if (mediaRecord) {
                    await self.copyFile(
                      fileName,
                      imagePath,
                      fileKey,
                      mediaRecord.mediaId,
                    );
                  }
                }
              }
            }
          }
        });
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  //Get FileKey
  async getFileKey(
    entity: string,
    type: string,
    fileuuid: string,
    fileName: string,
  ) {
    if (entity.toLowerCase() === 'farm') {
      if (type.toLowerCase() === 'logo') {
        return `${this.configService.get(
          'file.s3DirFarmProfileImage',
        )}/${uuidv4()}/${fileuuid}/${fileName}`;
      }
    } else if (entity.toLowerCase() === 'stallion') {
      if (type.toLowerCase() === 'profile') {
        return `${this.configService.get(
          'file.s3DirStallionProfileImage',
        )}/${uuidv4()}/${fileuuid}/${fileName}`;
      }
    }
  }

  //Get FileSize
  async sizeOfFile(key: string) {
    const s3 = new S3();
    try {
      return await s3
        .headObject({
          Key: key,
          Bucket: this.configService.get('file.assetBulkUploadBucket'),
        })
        .promise()
        .then((res) => res.ContentLength);
    } catch (err) {
      return false;
    }
  }

  //Copy File
  async copyFile(
    fileName: string,
    imagePath: string,
    fileKey: string,
    mediaId: number,
  ) {
    // Create an Amazon S3 service client object.
    const s3Client = new S3Client({
      region: this.configService.get('file.awsS3Region'),
      credentials: {
        accessKeyId: this.configService.get('file.accessKeyId'),
        secretAccessKey: this.configService.get('file.secretAccessKey'),
      },
    });

    const params = {
      Bucket: this.configService.get('file.awsDefaultS3Bucket'),
      CopySource: `/${this.configService.get(
        'file.assetBulkUploadBucket',
      )}/${imagePath}`,
      ACL: 'public-read',
      Key: fileKey,
    };
    let self = this;
    const run = async () => {
      try {
        await s3Client.send(new CopyObjectCommand(params));
        await self.updateMediaRecord(fileName, fileKey, mediaId);
      } catch (err) {
        console.log('Error', err);
      }
    };
    run();
  }

  //Update Media Record
  async updateMediaRecord(fileName: string, fileKey: string, mediaId: number) {
    let mediaFileType = 'image/' + /[^.]+$/.exec(fileName);
    let mediaFileSize = await this.sizeOfFile(fileKey);
    let mediaUrl = `${this.configService.get('file.imgixURI')}/${fileKey}`;
    if (mediaFileSize) {
      let record = await this.mediaService.findOneByMediaId(mediaId);
      record.fileName = fileName;
      record.mediaLocation = fileKey;
      record.mediaUrl = mediaUrl;
      record.mediaFileType = mediaFileType;
      record.mediaFileSize = mediaFileSize;
      await record.save();
    }
  }
}
