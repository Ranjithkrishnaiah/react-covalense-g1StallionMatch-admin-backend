import { registerAs } from '@nestjs/config';

export default registerAs('file', () => ({
  driver: process.env.FILE_DRIVER,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  awsDefaultS3Bucket: process.env.AWS_DEFAULT_S3_BUCKET,
  awsDefaultS3Url: process.env.AWS_DEFAULT_S3_URL,
  awsS3Region: process.env.AWS_S3_REGION,
  awsFileUploadUrlExpires: parseInt(process.env.AWS_S3_UPLOAD_FILE_EXPIRE_TIME),
  awsFileDownloadUrlExpires: parseInt(
    process.env.AWS_S3_DOWNLOAD_FILE_EXPIRE_TIME,
  ),
  awsFileDownloadUrlExpiresForOneDay: parseInt(
    process.env.AWS_S3_DOWNLOAD_FILE_EXPIRE_TIME_FOR_ONE_DAY,
  ),
  awsFileDownloadUrlExpiresForOneYear: parseInt(
    process.env.AWS_S3_DOWNLOAD_FILE_EXPIRE_TIME_FOR_ONE_YEAR,
  ),
  maxFileSize: 10000000, // 10mb
  s3DirMemberProfileImage: process.env.S3_DIR_MEMBER_PROFILE_IMAGE,
  s3DirStallionProfileImage: process.env.S3_DIR_STALLION_PROFILE_IMAGE,
  s3DirHorseProfileImage: process.env.S3_DIR_HORSE_PROFILE_IMAGE,
  s3DirStallionGalleryImage: process.env.S3_DIR_STALLION_GALLERY_IMAGE,
  s3DirStallionTestimonialImage: process.env.S3_DIR_STALLION_TESTIMONIAL_IMAGE,
  s3DirFarmProfileImage: process.env.S3_DIR_FARM_PROFILE_IMAGE,
  s3DirFarmGalleryImage: process.env.S3_DIR_FARM_GALLERY_IMAGE,
  s3DirFarmMediaImage: process.env.S3_DIR_FARM_MEDIA_IMAGE,
  s3DirMarketingPageImage: process.env.S3_DIR_MARKETING_PAGE_IMAGE,
  s3DirMarketingPageReportOverviewPdf:
    process.env.S3_DIR_MARKETING_PAGE_REPORT_OVERVIEW_PDF,
  maxLimitGalleryImage: parseInt(process.env.MAX_LIMIT_GALLERY_IMAGE),
  maxLimitStallionTestimonial: parseInt(
    process.env.MAX_LIMIT_STALLION_TESTIMONIAL,
  ),
  minImageSizeAllowed: parseInt(process.env.MIN_IMAGE_SIZE_ALLOWED),
  maxImageSizeAllowed: parseInt(process.env.MAX_IMAGE_SIZE_ALLOWED),
  minVideoSizeAllowed: parseInt(process.env.MIN_VIDEO_SIZE_ALLOWED),
  maxVideoSizeAllowed: parseInt(process.env.MAX_VIDEO_SIZE_ALLOWED),
  minPdfSizeAllowed: parseInt(process.env.MIN_PDF_SIZE_ALLOWED),
  maxPdfSizeAllowed: parseInt(process.env.MAX_PDF_SIZE_ALLOWED),
  assetBulkUploadBucket: process.env.AWS_ASSET_BULK_UPLOAD_BUCKET,
  imgixURI: process.env.IMGIX_URI,
  s3DirReportBroodmareSirePdf: process.env.S3_DIR_REPORT_BROODMARESIRE_PDF,
  s3DirReportStallionShortlistPdf:
    process.env.S3_DIR_REPORT_STALLION_SHORTLIST_PDF,
  s3DirReportSMProPdf: process.env.S3_DIR_REPORT_SM_PRO_PDF,
  s3DirReportBroodmareAffinityPdf:
    process.env.S3_DIR_REPORT_BROODMARE_AFFINITY_PDF,
  s3DirReportStallionAffinityPdf:
    process.env.S3_DIR_REPORT_STALLION_AFFINITY_PDF,
  s3DirReportSalesCateloguePdf: process.env.S3_DIR_REPORT_SALES_CATELOGUE_PDF,
  s3DirReportStockSalePdf: process.env.S3_DIR_REPORT_STOCK_SALE_PDF,
  s3DirMessageMedia: process.env.S3_DIR_MESSAGE_MEDIA,
  pathReportTemplateStyles:
    process.env.NODE_ENV == 'local'
      ? process.env.DEV_PATH_REPORT_TEMPLATE_STYLES
      : process.env.PROD_PATH_REPORT_TEMPLATE_STYLES,
  activityBaseUrl: process.env.ACTIVITY_BASE_URL,
  totalFarmRequiredFields: parseInt(process.env.TOTAL_FARM_REQUIRED_FIELDS),
  completePercentage: parseInt(process.env.COMPLETE_PERCENTAGE),
  totalRequiredFields: parseInt(process.env.TOTAL_REQUIRED_FIELDS),
  systemActivityAdminDashboard: process.env.SYSTEM_ACTIVITY_ADMIN_DASHBOARD,
  reportHorseProfileDefaultImage: process.env.REPORT_HORSE_PROFILE_DEFAULT_IMAGE,
  pathPortalReportTemplateStyles:
    process.env.NODE_ENV == 'local'
      ? process.env.DEV_PATH_PORTAL_RT_STYLES
      : process.env.PROD_PATH_PORTAL_RT_STYLES,
  s3DirStallionReportPdf:
    process.env.NODE_ENV == 'local'
      ? process.env.DEV_PATH_STALLION_REPORT
      : process.env.PROD_PATH_STALLION_REPORT,
}));
