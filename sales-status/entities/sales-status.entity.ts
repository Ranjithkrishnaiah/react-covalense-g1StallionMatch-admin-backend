import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('tblSalesStatus')
export class SalesStatus extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  status: number;

  @Column({ nullable: true })
  createdBy: number;

}
