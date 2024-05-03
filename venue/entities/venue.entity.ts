import { Country } from 'src/country/entity/country.entity';
import { RaceTrackType } from 'src/race-track-type/entities/race-track-type.entity';
import { Race } from 'src/race/entities/race.entity';
import { State } from 'src/states/entities/state.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblVenue')
export class Venue extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  displayName: string;

  @Column({ type: 'varchar' })
  importedName: string;

  @Column({ type: 'number' })
  countryId: number;

  @Column({ type: 'number' })
  stateId: string;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;

  @OneToMany(() => Race, (race) => race.venues)
  races: Race[];

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId', referencedColumnName: 'id' })
  country: Country;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'stateId', referencedColumnName: 'id' })
  state: State;

  @ManyToOne(() => RaceTrackType)
  @JoinColumn({ name: 'trackTypeId', referencedColumnName: 'id' })
  track: RaceTrackType;
}
