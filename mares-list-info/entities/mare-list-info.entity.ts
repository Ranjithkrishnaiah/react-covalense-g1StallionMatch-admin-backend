import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { MareList } from 'src/mares-list/entities/mares-list.entity';

@Entity('tblMaresList')
export class MareListInfo extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  listname: string;

  @Column({ nullable: true })
  listFileName: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @OneToMany(() => MareList, (marelist) => marelist.marelistinfo)
  marelists: MareList[];
}
