import { AdminModules } from 'src/admin-module-access-level/entities/admin-modules.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblAdminPageSettings')
export class PageSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  pageSettingsUuid: string;

  @Column({ nullable: true })
  settingsResponse: string;

  @Column()
  moduleId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => AdminModules)
  @JoinColumn({ name: 'moduleId', referencedColumnName: 'Id' })
  adminmodules: AdminModules;
}
