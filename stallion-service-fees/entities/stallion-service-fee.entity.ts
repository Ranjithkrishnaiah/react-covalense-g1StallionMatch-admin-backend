import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { Currency } from 'src/currencies/entities/currency.entity';
import { Member } from 'src/members/entities/member.entity';

@Entity('tblStallionServiceFee')
@Unique(['stallionId', 'currencyId'])
export class StallionServiceFee extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  stallionId: number;

  @Column({ nullable: true })
  currencyId: number;

  @Column({ nullable: true })
  fee: number;

  // new added
  @Column({ nullable: true })
  feeYear: number;
  // new added
  @Column({ default: true })
  isPrivateFee: Number;

  // /* 1 - Public / 2 - Private */
  // @Column({ nullable: true, type:'tinyint' })
  // feeStatus: number;

  /* 1 - SM Internal Update / 2 - Farm Update */
  @Column({ nullable: true, default: 1, type: 'tinyint' })
  feeUpdatedFrom: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @OneToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;
}
