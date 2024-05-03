import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchStallionMatch } from './entities/search-stallion-match.entity';
import { SearchStallionMatchService } from './search-stallion-match.service';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([SearchStallionMatch]),CommonUtilsModule],
  providers: [SearchStallionMatchService],
  exports: [SearchStallionMatchService],
})
export class SearchStallionMatchModule {}
