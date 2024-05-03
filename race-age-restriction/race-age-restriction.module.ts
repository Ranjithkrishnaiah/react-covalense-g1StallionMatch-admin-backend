import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceAgeRestriction } from './age-restriction.entity';
import { RaceAgeRestrictionController } from './race-age-restriction.controller';
import { RaceAgeRestrictionService } from './race-age-restriction.service';

@Module({
  imports: [TypeOrmModule.forFeature([RaceAgeRestriction])],
  controllers: [RaceAgeRestrictionController],
  providers: [RaceAgeRestrictionService],
})
export class RaceAgeRestrictionModule {}
