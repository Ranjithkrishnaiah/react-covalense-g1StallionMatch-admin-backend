import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblPaymentMethod')
export class PaymentMethod extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  paymentMethod: string;

}
