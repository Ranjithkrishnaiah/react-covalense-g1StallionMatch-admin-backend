import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppPermissionModule } from 'src/app-permission/app-permission.module';
import { ExcelModule } from 'src/excel/excel.module';
import { MemberAddressModule } from 'src/member-address/member-address.module';
import { Member } from 'src/members/entities/member.entity';
import { RoleModule } from 'src/role/role.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member]),
    RoleModule,
    MemberAddressModule,
    AppPermissionModule,
    ExcelModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
