import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaceWeather } from './entities/race-weather.entity';
import { RaceWeatherController } from './race-weather.controller';
import { RaceWeatherService } from './race-weather.service';

@Module({
  imports: [TypeOrmModule.forFeature([RaceWeather])],
  controllers: [RaceWeatherController],
  providers: [RaceWeatherService],
})
export class RaceWeatherModule {}
