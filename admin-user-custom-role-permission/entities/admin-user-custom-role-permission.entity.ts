import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Member } from 'src/members/entities/member.entity';
import { AdminModuleAccessLevel } from 'src/admin-module-access-level/entities/admin-module-access-level.entity';

@Entity('tblAdminUserCustomRolePermission')
export class AdminUserCustomRolePermission extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  memberId: number;

  @Column({ nullable: true })
  adminModuleAccessLevelId: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  createdBy: number;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId', referencedColumnName: 'id' })
  member: Member;

  @ManyToOne(() => AdminModuleAccessLevel)
  @JoinColumn({ name: 'adminModuleAccessLevelId', referencedColumnName: 'Id' })
  adminModuleAccessLevel: AdminModuleAccessLevel;
}
