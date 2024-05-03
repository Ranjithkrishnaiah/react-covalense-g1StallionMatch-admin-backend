import { Member } from 'src/members/entities/member.entity';
import {
  BaseEntity,
  Column,
  Entity,
  Generated,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tblRole')
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  RoleName: string;

  @Column()
  AccessPermissions: string;

  @Column()
  Rules: string;

  @Column()
  RoleId: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  roleUuid: number;

  @OneToMany(() => Member, (member) => member.roles)
  member: Member[];
}
