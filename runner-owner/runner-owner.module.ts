import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RunnerOwner } from './entities/runner-owner.entity';
import { RunnerOwnerController } from './runner-owner.controller';
import { RunnerOwnerService } from './runner-owner.service';

@Module({
  imports: [TypeOrmModule.forFeature([RunnerOwner])],
  controllers: [RunnerOwnerController],
  providers: [RunnerOwnerService],
})
export class RunnerOwnerModule {}
