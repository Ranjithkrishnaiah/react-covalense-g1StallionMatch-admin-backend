import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import * as mime from 'mime-types';

@Injectable()
export class FileUploadsService {
  constructor(private readonly configService: ConfigService) {}

  //Allowed Image Types
  private allowedImageTypes = ['png', 'jpg', 'jpeg'];
  //Allowed Video Types
  private allowedVideoTypes = ['mp4'];
  //Allowed Pdf Types
  private allowedPdfTypes = ['pdf'];
  //Allowed File Types
  private allowedFileTypes = ['doc', 'docx', 'pdf', 'xlsx'];
  //Allowed gif, mp4 along with other image types
  private allowedImageIncludingGifAndVideoTypes = ['png', 'jpg', 'jpeg', 'gif', 'mp4'];

  //Generate Get Presigned Url
  public async generateGetPresignedUrl(key: string) {
    const s3 = new S3();
    return await s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.get('file.awsDefaultS3Bucket'),
      Key: key,
      Expires: this.configService.get('file.awsFileDownloadUrlExpires'),
    });
  }

  //Generate Put Presigned Url
  public async generatePutPresignedUrl(key: string, fileType: string) {
    const s3 = new S3();
    return await s3.getSignedUrlPromise('putObject', {
      Bucket: this.configService.get('file.awsDefaultS3Bucket'),
      Key: key.toLowerCase(),
      ContentType: fileType,
      Expires: 3600, //this.configService.get('file.awsFileUploadUrlExpires'),
      ACL: 'public-read',
    });
  }

  //Allow Only Images
  async allowOnlyImages(fileType: string) {
    const extension = await mime.extension(fileType);
    if (!this.allowedImageTypes.includes(extension)) {
      throw new UnprocessableEntityException('Only image files are allowed!');
    }
  }

  //Allow Only Pdf
  async allowOnlyPdf(fileType: string) {
    const extension = await mime.extension(fileType);
    if (!this.allowedPdfTypes.includes(extension)) {
      throw new UnprocessableEntityException('Only pdf files are allowed!');
    }
  }

  //Allow Only Videos And Images
  async allowOnlyVideosAndImages(fileType: string) {
    const extension = await mime.extension(fileType);
    let allowedTypes = this.allowedImageTypes.concat(this.allowedVideoTypes);
    if (!allowedTypes.includes(extension)) {
      throw new UnprocessableEntityException(
        'Only video/image files are allowed!',
      );
    }
  }

  //Validate File Size
  async validateFileSize(fileType: string, fileSize: number) {
    const extension = await mime.extension(fileType);
    if (this.allowedImageTypes.includes(extension)) {
      if (fileSize < this.configService.get('file.minImageSizeAllowed')) {
        throw new UnprocessableEntityException(
          'Image minimum size criteria not matched!',
        );
      }
      if (fileSize > this.configService.get('file.maxImageSizeAllowed')) {
        throw new UnprocessableEntityException(
          'Image maximum size criteria not matched!',
        );
      }
    } else if (this.allowedVideoTypes.includes(extension)) {
      if (fileSize < this.configService.get('file.minVideoSizeAllowed')) {
        throw new UnprocessableEntityException(
          'Video minimum size criteria not matched!',
        );
      }
      if (fileSize > this.configService.get('file.maxVideoSizeAllowed')) {
        throw new UnprocessableEntityException(
          'Video maximum size criteria not matched!',
        );
      }
    } else if (this.allowedPdfTypes.includes(extension)) {
      // if (fileSize < this.configService.get('file.minPdfSizeAllowed')) {
      //     throw new UnprocessableEntityException('Pdf minimum size criteria not matched!');
      // }
      // if (fileSize > this.configService.get('file.maxPdfSizeAllowed')) {
      //     throw new UnprocessableEntityException('Pdf maximum size criteria not matched!');
      // }
    } else if (this.allowedFileTypes.includes(extension)) {
      if (fileSize < this.configService.get('file.minFileSizeAllowed')) {
        throw new UnprocessableEntityException(
          'File minimum size criteria not matched!',
        );
      }
      if (fileSize > this.configService.get('file.maxFileSizeAllowed')) {
        throw new UnprocessableEntityException(
          'File maximum size criteria not matched!',
        );
      }
    }
  }

  //Upload File To S3
  async uploadFileToS3(fileName: string, fileData: Buffer, mimeType: string) {
    try {
      let params = {
        Bucket: this.configService.get('file.awsDefaultS3Bucket'),
        Body: fileData,
        Key: fileName,
        ContentType: mimeType,
      };
      const s3 = new S3();
      return await s3.upload(params).promise();
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }

  //Allow Only Images And Files
  async allowOnlyImagesAndFiles(fileType: string) {
    const extension = await mime.extension(fileType);
    let allowedTypes = this.allowedImageTypes.concat(this.allowedFileTypes);
    if (!allowedTypes.includes(extension)) {
      throw new UnprocessableEntityException('Only File/image are allowed!');
    }
  }

  //Generate PreSignedUrl With Custom ExpireTime
  public async generateUrlWithCustomExpireTime(key: string) {
    const s3 = new S3();
    return await s3.getSignedUrlPromise('getObject', {
      Bucket: this.configService.get('file.awsDefaultS3Bucket'),
      Key: key,
      Expires: this.configService.get(
        'file.awsFileDownloadUrlExpiresForOneYear',
      ),
    });
  }

  //Allow Only Images including gif and mp4
  async allowOnlyImagesIncludingGifAndMp4(fileType: string) {
    const extension = await mime.extension(fileType);
    if (!this.allowedImageIncludingGifAndVideoTypes.includes(extension)) {
      throw new UnprocessableEntityException('Not a valid file type to upload!');
    }
  }
}
