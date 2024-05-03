import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Farm } from 'src/farms/entities/farm.entity';
import { Member } from 'src/members/entities/member.entity';
import { FarmAccessLevel } from 'src/farm-access-levels/entities/farm-access-level.entity';

@Entity('tblMemberFarm')
@Unique(['farmId', 'memberId'])
export class MemberFarm extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  farmId: number;

  @Column({ nullable: true })
  memberId: number;

  @Column({ nullable: true })
  accessLevelId: number;

  @Column({ nullable: true })
  RoleId: number;

  @Column()
  isFamOwner: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'id' })
  farm: Farm;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId', referencedColumnName: 'id' })
  member: Member;

  @ManyToOne(() => FarmAccessLevel)
  @JoinColumn({ name: 'accessLevelId', referencedColumnName: 'id' })
  farmaccesslevel: FarmAccessLevel;
}
