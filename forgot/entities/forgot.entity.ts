import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity';
import { Allow } from 'class-validator';
import { EntityHelper } from 'src/utils/entity-helper';

@Entity('tblMemberForgot')
export class Forgot extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Allow()
  @Column()
  @Index()
  hash: string;

  @Allow()
  @ManyToOne(() => Member, {
    eager: true,
  })
  member: Member;

  @Column({
    type: 'datetime2',
  })
  expiredOn: Date;

  @Column({ nullable: true })
  memberId: Number;

  // @BeforeInsert()
  // async setExpiredOn() {
  //   let exDate = new Date();
  //   exDate.setDate(exDate.getDate()  + 1)
  //   this.expiredOn = exDate
  // }

  @CreateDateColumn()
  createdOn: Date;

  @DeleteDateColumn()
  deletedOn: Date;
}
