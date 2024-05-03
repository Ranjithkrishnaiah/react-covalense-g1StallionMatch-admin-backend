import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Stallion } from 'src/stallions/entities/stallion.entity';
@Entity('tblAuditStallion')
export class StallionAuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  activityType: number;
  // Get it tblactityType

  @Column()
  entityId: string;
  //horseId, farmId, stallionId, memberId --> UUID's

  @Column()
  attributeName: string;
  // Coloumn name

  @Column()
  newValue: string;
  // while creating send the whole object and new value will complete object
  // @Column('simple-json', { nullable: true })
  // entityValue: string

  @Column()
  oldValue: string;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: number;

  @Column({ nullable: true })
  createdBy: number;
  // all the time should be udpated.
  @Column()
  createdOn: Date;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'entityId', referencedColumnName: 'stallionUuid' })
  stallion: Stallion;
}
