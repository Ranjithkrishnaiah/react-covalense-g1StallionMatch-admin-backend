import { Farm } from 'src/farms/entities/farm.entity';
import { Member } from 'src/members/entities/member.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tblActivityFarmStallion')
export class SystemActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  activityTypeId: number;

  @Column()
  farmId: string;

  @Column()
  stallionId: string;

  @Column()
  additionalInfo: string;

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

  @Column()
  result: string;

  @Column()
  reportType: string;

  @Column()
  entityId: string;

  @Column()
  activityModule: string;

  @Column()
  createdBy: number;

  @Column()
  createdOn: Date;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'farmUuid' })
  farm: Farm;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'stallionUuid' })
  stallion: Stallion;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;
}
