import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('tblSocialLink')
export class SocialLink extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  socialLinkName: string;

  @OneToMany(() => SocialLink, (link) => link.member)
  member: SocialLink[];
}
