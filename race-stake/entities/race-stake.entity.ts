import { Race } from 'src/race/entities/race.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblRaceStake')
export class RaceStake extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  displayName: string;

  @Column({ type: 'varchar' })
  importedName: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;

  @OneToMany(() => Race, (race) => race.racestakes)
  races: Race[];
}
