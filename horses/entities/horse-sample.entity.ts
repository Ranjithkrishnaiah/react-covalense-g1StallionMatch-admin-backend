import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblHorseSample')
export class HorseSample extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  horseUuid: string;

  @Column({ type: 'varchar' })
  horseName: string;

  @Column({ nullable: true })
  sireId: number;

  @Column({ nullable: true })
  damId: number;

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

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  verifiedBy: number;

  @Column({ nullable: true })
  verifiedOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @Column({ default: false })
  isArchived: boolean;
}
