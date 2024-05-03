import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { OneToMany } from 'typeorm';
import { AdminModules } from '../entities/admin-modules.entity';

export class AdminModuleAcessLevelDto {
  @ApiProperty()
  @IsNumber()
  Id: number;

  @ApiProperty()
  @IsString()
  accessLevel: string;

  @OneToMany(() => AdminModules, (module) => module.Id)
  adminModule: AdminModules;
}
