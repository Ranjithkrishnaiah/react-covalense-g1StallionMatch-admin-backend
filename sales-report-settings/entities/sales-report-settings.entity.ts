import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('tblSalesReportsetting')
export class SalesReportsetting extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  impactAnalysisTypeId: number;

  @Column({ type: 'int' })
  saleId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

}
