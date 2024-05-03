import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Horse } from 'src/horses/entities/horse.entity';
import { Member } from 'src/members/entities/member.entity';

@Entity('tblFavouriteMare')
export class FavouriteMare extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  mareId: number;

  /*this is nothing but memberId*/
  @Column({ nullable: true })
  memberId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'mareId', referencedColumnName: 'id' })
  horse: Horse;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId', referencedColumnName: 'id' })
  member: Member;
}
