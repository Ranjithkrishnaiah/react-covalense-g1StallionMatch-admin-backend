import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FarmsModule } from 'src/farms/farms.module';
import { MareList } from './entities/mares-list.entity';
import { MaresListController } from './mares-list.controller';
import { MaresListService } from './mares-list.service';

@Module({
  imports: [TypeOrmModule.forFeature([MareList]), FarmsModule],
  controllers: [MaresListController],
  providers: [MaresListService],
})
export class MaresListModule {}
