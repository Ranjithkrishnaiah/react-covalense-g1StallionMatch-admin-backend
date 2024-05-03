import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorsesModule } from 'src/horses/horses.module';
import { HorseCobAlias } from './entities/horse-cob-alias.entity';
import { HorseCobAliasController } from './horse-cob-alias.controller';
import { HorseCobAliasService } from './horse-cob-alias.service';

@Module({
  imports: [TypeOrmModule.forFeature([HorseCobAlias]), HorsesModule],
  controllers: [HorseCobAliasController],
  providers: [HorseCobAliasService],
})
export class HorseCobAliasModule {}
