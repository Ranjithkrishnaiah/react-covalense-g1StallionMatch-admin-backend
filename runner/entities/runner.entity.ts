import { Currency } from 'src/currencies/entities/currency.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { EligibleHorseView } from 'src/horses/entities/view/eligible-horse-view.entity';
import { Member } from 'src/members/entities/member.entity';
import { Race } from 'src/race/entities/race.entity';
import { EligibleRaceSwView } from 'src/race/entities/view/eligible-race-sw-view.entity';
import { EligibleRaceView } from 'src/race/entities/view/eligible-race-view.entity';
import { FinalPosition } from 'src/runner-final-position/entities/runner-final-position.entity';
import { RunnerJockey } from 'src/runner-jockey/entities/runner-jockey.entity';
import { RunnerOwner } from 'src/runner-owner/entities/runner-owner.entity';
import { RunnerSilksColour } from 'src/runner-silks-colour/entities/runner-silk-colours.entity';
import { RunnerTrainer } from 'src/runner-trainer/entities/runner-trainer.entity';
import { WeightUnit } from 'src/weight-unit/entities/weight-unit.entity';
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
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblRunner')
export class Runner extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  runnerUuid: string;

  @Column({ nullable: true })
  raceId: number;

  @Column({ nullable: true })
  horseId: number;

  @Column({ nullable: true })
  number: number;

  @Column({ nullable: true })
  barrier: number;

  @Column({ nullable: true })
  finalPositionId: number;

  @Column({ nullable: true })
  margin: string;

  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  weightUnitId: number;

  @Column({ nullable: true })
  jockeyId: number;

  @Column({ nullable: true })
  trainerId: number;

  @Column({ nullable: true })
  ownerId: number;

  @Column({ nullable: true })
  silksColourId: number;

  @Column({ nullable: true })
  prizemoneyWon: number;

  @Column({ nullable: true })
  startingPrice: number;

  @Column({ nullable: true })
  currencyId: number;

  @Column({ nullable: true })
  isApprentice: boolean;

  @Column({ nullable: true })
  isScratched: boolean;

  @Column({ nullable: true })
  sourceId: number;

  @Column({ nullable: true })
  isEligible: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;

  @ManyToOne(() => Race)
  @JoinColumn({ name: 'raceId', referencedColumnName: 'id' })
  races: Race;

  @OneToMany(
    () => EligibleRaceSwView,
    (eligibleRaceSwView) => eligibleRaceSwView.vwSwraces,
  )
  vwSwraces: EligibleRaceSwView[];

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'horseId', referencedColumnName: 'id' })
  horses: Horse;

  @OneToMany(
    () => EligibleHorseView,
    (eligibleHorseView) => eligibleHorseView.vwHorses,
  )
  vwHorses: EligibleHorseView[];

  @ManyToOne(() => FinalPosition)
  @JoinColumn({ name: 'finalPositionId', referencedColumnName: 'id' })
  positions: FinalPosition;

  @ManyToOne(() => WeightUnit)
  @JoinColumn({ name: 'weightUnitId', referencedColumnName: 'id' })
  weightUnits: WeightUnit;

  @ManyToOne(() => RunnerSilksColour)
  @JoinColumn({ name: 'silksColourId', referencedColumnName: 'id' })
  silksColors: RunnerSilksColour;

  @ManyToOne(() => RunnerOwner)
  @JoinColumn({ name: 'ownerId', referencedColumnName: 'id' })
  owner: RunnerOwner;

  @ManyToOne(() => RunnerTrainer)
  @JoinColumn({ name: 'trainerId', referencedColumnName: 'id' })
  trainer: RunnerTrainer;

  @ManyToOne(() => RunnerJockey)
  @JoinColumn({ name: 'jockeyId', referencedColumnName: 'id' })
  jockey: RunnerJockey;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'modifiedBy', referencedColumnName: 'id' })
  member: Member;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  members: Member;
  
  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;

}
