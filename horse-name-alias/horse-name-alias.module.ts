import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorsesModule } from 'src/horses/horses.module';
import { HorseNameAlias } from './entities/horse-name-alias.entity';
import { HorseNameAliasController } from './horse-name-alias.controller';
import { HorseNameAliasService } from './horse-name-alias.service';

@Module({
  imports: [TypeOrmModule.forFeature([HorseNameAlias]), HorsesModule],
  controllers: [HorseNameAliasController],
  providers: [HorseNameAliasService],
})
export class HorseNameAliasModule {}
