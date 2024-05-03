import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('tblSocialShareType')
export class SocialShareType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  socialShareType: string;

  @CreateDateColumn()
  createdOn: Date;
}
