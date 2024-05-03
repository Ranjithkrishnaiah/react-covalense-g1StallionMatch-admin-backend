import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Horse } from 'src/horses/entities/horse.entity';
import { EntityHelper } from 'src/utils/entity-helper';

@Entity('tblHorseNameAlias')
export class HorseNameAlias extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  horseName: string;

  @Column({ nullable: true })
  horseId: number;

  @Column()
  isDefault: boolean;

  @Column()
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'horseId', referencedColumnName: 'id' })
  horse: Horse;
}
