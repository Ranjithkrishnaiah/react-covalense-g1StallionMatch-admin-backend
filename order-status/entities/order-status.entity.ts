import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { OrderReportStatus } from 'src/order-report-status/entities/order-report-status.entity';

@Entity('tblOrderStatus')
export class OrderStatus extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @Column()
  orderStatusCode: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @OneToMany(
    () => OrderReportStatus,
    (orderReportStatus) => orderReportStatus.orderStatus,
  )
  orderReportStatus: OrderReportStatus;
}
