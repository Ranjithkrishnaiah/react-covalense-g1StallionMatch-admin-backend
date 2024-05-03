import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonUtilsModule } from 'src/common-utils/common-utils.module';
import { SystemActivity } from './entities/system-activity.entity';
import { SystemActivitiesController } from './system-activities.controller';
import { SystemActivitiesService } from './system-activities.service';

@Module({
  imports: [TypeOrmModule.forFeature([SystemActivity]), CommonUtilsModule],
  controllers: [SystemActivitiesController],
  providers: [SystemActivitiesService],
})
export class SystemActivitiesModule {}
