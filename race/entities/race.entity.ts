import { DistanceUnit } from 'src/distance-unit/entities/distance-unit.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { Member } from 'src/members/entities/member.entity';
import { RaceClass } from 'src/race-class/entities/race-class.entity';
import { RaceStake } from 'src/race-stake/entities/race-stake.entity';
import { RaceStatus } from 'src/race-status/entities/race-status.entity';
import { RaceTrackCondition } from 'src/race-track-condition/entities/race-track-condition.entity';
import { RaceTrackType } from 'src/race-track-type/entities/race-track-type.entity';
import { RaceType } from 'src/race-type/entities/race-type.entity';
import { Runner } from 'src/runner/entities/runner.entity';
import { Venue } from 'src/venue/entities/venue.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblRace')
export class Race extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  raceUuid: string;

  @Column()
  sourceId: number;

  @Column()
  raceDate: Date;

  @Column()
  raceTime: string;

  @Column()
  venueId: number;

  @Column()
  trackTypeId: number;

  @Column()
  trackConditionId: number;

  @Column({ type: 'varchar' })
  displayName: string;

  @Column({ type: 'varchar' })
  importedName: string;

  @Column({ type: 'decimal' })
  raceDistance: number;

  @Column({ type: 'int' })
  distanceUnitId: number;

  @Column({ type: 'int' })
  raceAgeRestrictionId: number;

  @Column({ type: 'int' })
  raceSexRestrictionId: number;

  @Column({ type: 'int' })
  raceClassId: number;

  @Column({ type: 'int' })
  raceStakeId: number;

  @Column({ type: 'int' })
  raceNumber: number;

  @Column({ type: 'int' })
  currencyId: number;

  @Column({ type: 'decimal' })
  racePrizemoney: number;

  @Column({ type: 'int' })
  raceTypeId: number;

  @Column({ type: 'int' })
  raceWeatherId: number;

  @Column({ type: 'int' })
  raceStatusId: number;

  @Column()
  isEligible: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;

  @ManyToOne(() => RaceClass)
  @JoinColumn({ name: 'raceClassId', referencedColumnName: 'id' })
  raceclasses: RaceClass;

  @ManyToOne(() => RaceStake)
  @JoinColumn({ name: 'raceStakeId', referencedColumnName: 'id' })
  racestakes: RaceStake;

  @ManyToOne(() => RaceStatus)
  @JoinColumn({ name: 'raceStatusId', referencedColumnName: 'id' })
  racestatuses: RaceStatus;

  @ManyToOne(() => RaceTrackCondition)
  @JoinColumn({ name: 'trackConditionId', referencedColumnName: 'id' })
  trackconditions: RaceTrackCondition;

  @ManyToOne(() => RaceTrackType)
  @JoinColumn({ name: 'trackTypeId', referencedColumnName: 'id' })
  tracktypes: RaceTrackType;

  @ManyToOne(() => Venue)
  @JoinColumn({ name: 'venueId', referencedColumnName: 'id' })
  venues: Venue;

  @ManyToOne(() => RaceType)
  @JoinColumn({ name: 'raceTypeId', referencedColumnName: 'id' })
  racetypes: RaceType;

  @OneToMany(() => Runner, (runner) => runner.races)
  runners: Runner[];

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'raceStakeId', referencedColumnName: 'id' })
  races: Horse;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'modifiedBy', referencedColumnName: 'id' })
  members: Member;

  @OneToOne(() => DistanceUnit)
  @JoinColumn({ name: 'distanceUnitId', referencedColumnName: 'id' })
  distanceunit: DistanceUnit;
}
