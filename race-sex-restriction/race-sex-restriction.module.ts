import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceSexRestriction } from './entities/race-sex-restriction.entity';
import { RaceSexRestrictionController } from './race-sex-restriction.controller';
import { RaceSexRestrictionService } from './race-sex-restriction.service';

@Module({
  imports: [TypeOrmModule.forFeature([RaceSexRestriction])],
  controllers: [RaceSexRestrictionController],
  providers: [RaceSexRestrictionService],
})
export class RaceSexRestrictionModule {}
