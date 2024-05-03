import { Currency } from 'src/currencies/entities/currency.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { Member } from 'src/members/entities/member.entity';
import { SalesLotInfoTemp } from 'src/sales-lot-info-temp/entities/sale-lot-info-temp.entity';
import { Salestype } from 'src/sales-type/entities/sales-type.entity';
import { Sales } from 'src/sales/entities/sales.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblSalesLot')
export class SalesLot extends EntityHelper {
  @PrimaryGeneratedColumn()
  Id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  salesLotUuid: string;

  @Column({ type: 'int' })
  salesId: number;

  @Column()
  isNamed: boolean;

  @Column({ type: 'int' })
  bookNumber: number;

  @Column({ type: 'int' })
  dayNumber: number;

  @Column({ type: 'varchar' })
  lotCode: string;

  @Column({ type: 'int' })
  lotNumber: number;

  @Column({ type: 'int' })
  lotType: number;

  @Column({ type: 'int' })
  horseId: number;

  @Column({ type: 'varchar' })
  horseGender: string;

  @Column({ type: 'varchar' })
  venderName: string;

  @Column({ type: 'varchar' })
  buyerName: string;

  @Column({ type: 'varchar' })
  buyerLocation: string;

  @Column({ type: 'varchar' })
  price: string;

  @Column({ type: 'int' })
  priceCurrencyId: number;

  @Column({ type: 'varchar' })
  coveringStallionName: string;

  @Column({ nullable: true })
  isWithdrawn: boolean;

  @Column({ nullable: true })
  notMatchedLot: boolean;

  @Column({ nullable: true })
  notMatchedSireDam: boolean;

  @Column({ nullable: true })
  isVerified: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  modifiedBy: number;

  @Column({ nullable: true })
  isSelectedForSetting: boolean;

  @UpdateDateColumn()
  modifiedOn: Date;

  @Column({ nullable: true })
  verifiedBy: number;

  @UpdateDateColumn()
  verifiedOn: Date;

  @OneToOne(() => Horse)
  @JoinColumn({ name: 'horseId', referencedColumnName: 'id' })
  horse: Horse;

  @ManyToOne(() => Sales)
  @JoinColumn({ name: 'salesId', referencedColumnName: 'Id' })
  sales: Sales;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'verifiedBy', referencedColumnName: 'id' })
  member: Member;

  @OneToOne(
    () => SalesLotInfoTemp,
    (salesLotInfoTemp) => salesLotInfoTemp.salesLot,
  )
  salesLotInfoTemp: SalesLotInfoTemp[];

  @ManyToOne(() => Salestype)
  @JoinColumn({ name: 'lotType', referencedColumnName: 'Id' })
  lotTypes: Salestype;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'priceCurrencyId', referencedColumnName: 'id' })
  currency: Currency;
}
