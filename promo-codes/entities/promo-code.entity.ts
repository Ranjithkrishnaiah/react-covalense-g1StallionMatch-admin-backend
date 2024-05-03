import { DurationType } from 'aws-sdk/clients/secretsmanager';
import { Currency } from 'src/currencies/entities/currency.entity';
import { OrderTransaction } from 'src/order-transaction/entities/order-transaction.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';

@Entity('tblPromoCode')
export class PromoCode extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  promoCode: string;

  @Column({ nullable: true })
  discountType: string;

  @Column({ nullable: true })
  price: number;

  @Column({ nullable: true })
  currencyId: number;

  @Column({ nullable: true })
  productids: string;

  @Column({ nullable: true })
  memberId: number;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true })
  durationType: DurationType;

  @Column({ nullable: true })
  durationNo: number;

  @Column({ nullable: true })
  redemtions: number;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  createdBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @Column({ nullable: true })
  isActive: Boolean;

  @Column({ nullable: true })
  promoCodeName: string;

  @Column()
  userIds: string;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;

  @OneToMany(
    () => OrderTransaction,
    (orderTransaction) => orderTransaction.coupon,
  )
  orderTransaction: OrderTransaction[];
}
