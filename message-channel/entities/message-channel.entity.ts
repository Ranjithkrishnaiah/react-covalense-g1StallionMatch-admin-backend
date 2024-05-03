import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Unique,
} from 'typeorm';

import { EntityHelper } from '../../utils/entity-helper';
import { Member } from 'src/members/entities/member.entity';
import { Farm } from 'src/farms/entities/farm.entity';

@Entity('tblMessageChannel')
export class MessageChannel extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  txId: number;

  @Column()
  txEmail: string;

  @Column()
  rxId: number;

  @Column()
  channelUuid: string;

  @Column({ default: 1 })
  isActive: boolean;

  @Column({ default: 0 })
  isFlagged: boolean;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'txId', referencedColumnName: 'id' })
  member: Member;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'rxId', referencedColumnName: 'id' })
  farm: Farm;



}
