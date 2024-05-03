import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tblAdminModuleAccessLevel')
export class AdminModuleAccessLevel extends BaseEntity {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  adminModuleId: number;

  @Column({ nullable: true })
  accessLevel: string;
}
