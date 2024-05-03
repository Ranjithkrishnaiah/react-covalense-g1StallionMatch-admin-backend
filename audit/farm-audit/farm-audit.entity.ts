import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Farm } from 'src/farms/entities/farm.entity';
@Entity('tblAuditFarm')
export class FarmAuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  activityType: number;

  @Column()
  entityId: string;

  @Column()
  attributeName: string;

  @Column()
  newValue: string;

  @Column()
  oldValue: string;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column()
  createdOn: Date;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'entityId', referencedColumnName: 'farmUuid' })
  farm: Farm;
}
