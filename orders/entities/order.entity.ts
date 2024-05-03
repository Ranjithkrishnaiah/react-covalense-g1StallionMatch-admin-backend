import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Country } from 'src/country/entity/country.entity';
import { Currency } from 'src/currencies/entities/currency.entity';
import { IsEmail, IsString } from 'class-validator';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { OrderTransaction } from 'src/order-transaction/entities/order-transaction.entity';
import { Member } from 'src/members/entities/member.entity';

@Entity('tblOrder')
export class Order extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currencyId: number;

  @Column()
  @IsString()
  sessionId: string;

  @Column()
  fullName: string;

  @Column()
  @IsEmail()
  email: string;

  @Column()
  total: number;

  @Column()
  postalCode: string;

  @Column()
  countryId: number;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  memberId: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId', referencedColumnName: 'id' })
  country: Country;

  @Column({ default: 1 })
  orderStatusId: number;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
  orderProduct: OrderProduct[];
  
  @OneToMany(
    () => OrderTransaction,
    (orderTransaction) => orderTransaction.order,
  )
  orderTransaction: OrderTransaction[];

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId', referencedColumnName: 'id' })
  member: Member;
}
