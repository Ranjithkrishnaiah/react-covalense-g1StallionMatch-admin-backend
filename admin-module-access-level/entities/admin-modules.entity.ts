import {
  BaseEntity,
  Column,
  Entity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblAdminModule')
export class AdminModules extends BaseEntity {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  moduleName: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;
}
