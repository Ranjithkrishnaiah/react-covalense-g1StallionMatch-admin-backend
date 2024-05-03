import { Module } from '@nestjs/common';
import { CommonUtilsService } from './common-utils.service';

@Module({
  providers: [CommonUtilsService],
  exports: [CommonUtilsService],
})
export class CommonUtilsModule {}
