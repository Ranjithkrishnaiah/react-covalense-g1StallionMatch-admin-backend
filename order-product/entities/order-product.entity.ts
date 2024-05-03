import { Member } from 'src/members/entities/member.entity';
import { OrderProductItem } from 'src/order-product-items/entities/order-product-item.entity';
import { OrderReportStatus } from 'src/order-report-status/entities/order-report-status.entity';
import { OrderStatus } from 'src/order-status/entities/order-status.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Product } from 'src/products/entities/product.entity';
import { ReportProductItem } from 'src/report-product-items/entities/report-product-item.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tblOrderProduct')
export class OrderProduct extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  orderProductUuid: string;

  @Column()
  orderId: number;

  @Column()
  productId: number;

  @Column()
  price: number;

  @Column()
  quantity: number;

  @Column()
  pdfLink: string;

  @Column()
  isLinkActive: boolean;

  @Column()
  orderStatusId: number;

  @Column({ nullable: true })
  selectedPriceRange: string;
  
  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @CreateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId', referencedColumnName: 'id' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;

  @OneToMany(
    () => OrderProductItem,
    (orderProductItem) => orderProductItem.orderproduct,
  )
  orderProductItem: OrderProductItem[];

  @OneToMany(
    () => OrderReportStatus,
    (orderReportStatus) => orderReportStatus.orderproduct,
  )
  orderReportStatus: OrderReportStatus[];

  @OneToMany(() => ReportProductItem, (reportProductItem) => reportProductItem.orderproduct)
  reportProductItem: ReportProductItem[];

  @ManyToOne(() => OrderStatus)
  @JoinColumn({ name: 'orderStatusId', referencedColumnName: 'id' })
  orderstatus: OrderStatus;

}
