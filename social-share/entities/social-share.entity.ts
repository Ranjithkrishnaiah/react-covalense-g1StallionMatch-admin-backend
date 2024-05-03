import { Race } from 'src/race/entities/race.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblMemberSocialShare')
export class SocialShare extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  entityId: number;

  @Column({ type: 'varchar' })
  entityType: string;

  @Column()
  socialShareTypeId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ type: 'varchar' })
  ipAddress: string;

  @Column({ type: 'varchar' })
  userAgent: string;

  @Column({ nullable: true })
  pdfLink: string;
 
  @Column({ nullable: true })
  toEmail: string;

  @Column({ nullable: true })
  comment: string;

  @OneToMany(() => SocialShare, (link) => link.member)
  member: SocialShare[];
}
