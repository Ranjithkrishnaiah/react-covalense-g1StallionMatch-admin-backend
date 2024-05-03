import { SalesLot } from 'src/sales-lots/entities/sales-lots.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity('tblSalesType')
export class Salestype extends EntityHelper {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'varchar' })
  salesTypeName: string;

  @Column({ type: 'int', nullable: true })
  salesTypeDescription: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @OneToMany(() => SalesLot, (salesLot) => salesLot.Id)
  salesLot: SalesLot;

}
