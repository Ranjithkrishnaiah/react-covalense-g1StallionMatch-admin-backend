import { Member } from 'src/members/entities/member.entity';
import { SalesCompany } from 'src/sales-company/entities/sales-company.entity';
import { SalesLot } from 'src/sales-lots/entities/sales-lots.entity';
import { SalesStatus } from 'src/sales-status/entities/sales-status.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Country } from '../../country/entity/country.entity';
import { Salestype } from 'src/sales-type/entities/sales-type.entity';

@Entity('tblSales')
export class Sales extends EntityHelper {
  @PrimaryGeneratedColumn()
  Id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  salesUuid: string;

  @Column({ type: 'varchar' })
  salesName: string;

  @Column({ type: 'varchar' })
  salesCode: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  countryId: number;

  @Column({ type: 'int', nullable: true })
  salesCompanyId: number;

  @Column({ type: 'int', nullable: true })
  salesInfoId: number;

  @Column({ type: 'int', nullable: true })
  salesTypeId: number;

  @Column()
  isOnlineSales: boolean;

  @Column()
  isPublic: boolean;

  @Column()
  isHIP: boolean;

  @Column()
  isActive: boolean;

  @Column({ type: 'varchar' })
  salesfileURL: string;

  @Column({ type: 'varchar' })
  salesfileURLSDX: string;

  @Column({ nullable: true })
  statusId: number;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId', referencedColumnName: 'id' })
  country: Country;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;

  @ManyToOne(() => SalesCompany)
  @JoinColumn({ name: 'salesCompanyId', referencedColumnName: 'Id' })
  salesCompany: SalesCompany;

  @ManyToOne(() => SalesStatus)
  @JoinColumn({ name: 'statusId', referencedColumnName: 'id' })
  salesStatus: SalesStatus;

  @ManyToOne(() => Salestype)
  @JoinColumn({ name: 'salesTypeId', referencedColumnName: 'Id' })
  salesType: Salestype;

  @OneToMany(() => SalesLot, (lot) => lot.Id)
  salesLot: SalesLot;
}
