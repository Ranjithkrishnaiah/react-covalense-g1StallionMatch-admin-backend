import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('tblAddNewHorseBatch')
export class HorseBulk extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  batch: string;

  @Column({ type: 'varchar' })
  existingHorseId: string;

  @Column({ type: 'varchar' })
  horseName: string;

  @Column({ nullable: true })
  sireId: number;

  @Column({ nullable: true })
  damId: number;

  @Column({ nullable: true })
  maintblSireId: number;

  @Column({ nullable: true })
  maintblDamId: number;

  @Column({ nullable: true })
  countryId: number;

  @Column({ nullable: true })
  colourId: number;

  @Column({ nullable: true })
  horseTypeId: number;

  @Column({ type: 'smallint', nullable: true })
  yob: number;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ type: 'char', nullable: true })
  sex: string;

  @Column({ default: false })
  gelding: boolean;

  @Column({ nullable: true })
  currencyId: number;

  @Column({ nullable: true, type: 'decimal', precision: 20, scale: 2 })
  totalPrizeMoneyEarned: number;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ default: false })
  batchStatus: boolean;

  @Column({ default: false })
  isFormDataModified: boolean;

  @Column({ type: 'varchar' })
  requestId?: string;
}
