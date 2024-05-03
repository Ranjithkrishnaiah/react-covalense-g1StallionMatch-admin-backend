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
import { AdminModuleAccessLevel } from 'src/admin-module-access-level/entities/admin-module-access-level.entity';
import { Role } from 'src/role/entities/role.entity';

@Entity('tblAdminPortalRule')
export class AdminPortalRule extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  roleId: number;

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

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId', referencedColumnName: 'Id' })
  role: Role;

  @ManyToOne(() => AdminModuleAccessLevel)
  @JoinColumn({ name: 'adminModuleAccessLevelId', referencedColumnName: 'Id' })
  adminModuleAccessLevel: AdminModuleAccessLevel;
}
