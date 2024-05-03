import { Module, Global } from '@nestjs/common';
import { ImportAssetService } from './import-asset.service';
import { ImportAssetController } from './import-asset.controller';
import { FarmsModule } from 'src/farms/farms.module';
import { StallionsModule } from 'src/stallions/stallions.module';
import { FileUploadsModule } from 'src/file-uploads/file-uploads.module';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { MediaModule } from 'src/media/media.module';

@Global()
@Module({
  imports: [
    FarmsModule,
    StallionsModule,
    FileUploadsModule,
    CommonUtilsModule,
    MediaModule,
  ],
  controllers: [ImportAssetController],
  providers: [ImportAssetService],
  exports: [ImportAssetService],
})
export class ImportAssetModule {}
