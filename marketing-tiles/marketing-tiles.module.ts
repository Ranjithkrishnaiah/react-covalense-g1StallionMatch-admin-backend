import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingTilesService } from './marketing-tiles.service';
import { MarketingTilesController } from './marketing-tiles.controller';
import { MarketingTiles } from './entities/marketing-tile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MarketingTiles])],
  controllers: [MarketingTilesController],
  providers: [MarketingTilesService],
  exports: [MarketingTilesService],
})
export class MarketingTilesModule {}
