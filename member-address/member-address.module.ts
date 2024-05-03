import { Module } from '@nestjs/common';
import { MemberAddressService } from './member-address.service';
import { MemberAddressController } from './member-address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberAddress } from './entities/member-address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberAddress])],
  controllers: [MemberAddressController],
  providers: [MemberAddressService],
  exports: [MemberAddressService],
})
export class MemberAddressModule {}
