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
import { Order } from 'src/orders/entities/order.entity';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';

import { PaymentMethod } from 'src/payment-methods/entities/payment-method.entity';
import { IsString } from 'class-validator';
import { PaymentStatus } from 'src/payment-status/entities/payment-status.entity';
import { PromoCode } from 'src/promo-codes/entities/promo-code.entity';

@Entity('tblOrderTransaction')
export class OrderTransaction extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @Column()
  couponId: number;

  @Column()
  sessionId: string;

  @Column()
  memberId: number;

  @Column()
  total: number;

  @Column()
  subTotal: number;

  @Column()
  discount: number;

  @Column()
  mode: string;

  @Column()
  status: string;

  @Column()
  paymentStatus: number;

  @Column()
  paymentMethod: number;

  @Column()
  @IsString()
  paymentIntent: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column()
  taxvalue: number;

  @Column()
  taxPercent: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'orderId', referencedColumnName: 'id' })
  order: Order;

  @ManyToOne(() => OrderProduct)
  @JoinColumn({ name: 'orderId', referencedColumnName: 'orderId' })
  orderproduct: OrderProduct;

  @ManyToOne(() => PaymentStatus)
  @JoinColumn({ name: 'paymentStatus', referencedColumnName: 'id' })
  paymentstatus: PaymentStatus;

  @ManyToOne(() => PromoCode)
  @JoinColumn({ name: 'couponId', referencedColumnName: 'id' })
  coupon: PromoCode;

  @ManyToOne(() => PaymentMethod)
  @JoinColumn({ name: 'paymentMethod', referencedColumnName: 'id' })
  paymentmethod: PaymentMethod;
}
