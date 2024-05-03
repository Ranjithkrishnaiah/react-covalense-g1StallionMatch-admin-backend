import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Stallion } from 'src/stallions/entities/stallion.entity';

@Entity('tblStallionPromotion')
export class StallionPromotion extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  stallionId: number;

  @CreateDateColumn()
  startDate: Date;

  @CreateDateColumn()
  endDate: Date;

  @Column({ default: 1 })
  promotedCount: number;

  @Column({ default: 0 })
  stopPromotionCount: number;

  @Column({ default: false })
  isAutoRenew: boolean;

  @Column({ default: false })
  isAdminPromoted: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @OneToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;
}
