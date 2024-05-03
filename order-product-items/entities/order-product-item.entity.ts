import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { Farm } from 'src/farms/entities/farm.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { StallionPromotion } from 'src/stallion-promotions/entities/stallion-promotion.entity';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';

@Entity('tblOrderProductItem')
export class OrderProductItem extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderProductId: number;

  @Column()
  stallionId: number;

  @Column()
  farmId: number;

  @Column()
  mareId: number;

  @Column()
  stallionPromotionId: number;

  @Column()
  stallionNominationId: number;

  @Column()
  sales: string;

  @Column()
  commonList: string;
  
  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'id' })
  farm: Farm;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'mareId', referencedColumnName: 'id' })
  horse: Horse;

  @ManyToOne(() => StallionPromotion)
  @JoinColumn({ name: 'stallionPromotionId', referencedColumnName: 'id' })
  stallionPromotion: StallionPromotion;

  @ManyToOne(() => OrderProduct)
  @JoinColumn({ name: 'orderProductId', referencedColumnName: 'id' })
  orderproduct: OrderProduct;
}
