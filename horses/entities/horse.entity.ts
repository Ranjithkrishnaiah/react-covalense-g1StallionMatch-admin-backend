import { Colour } from 'src/colours/entities/colour.entity';
import { Currency } from 'src/currencies/entities/currency.entity';
import { FavouriteBroodmareSire } from 'src/favourite-broodmare-sires/entities/favourite-broodmare-sire.entity';
import { HorseType } from 'src/horse-types/entities/horse-type.entity';
import { MemberMare } from 'src/member-mares/entities/member-mare.entity';
import { Member } from 'src/members/entities/member.entity';
import { NominationRequest } from 'src/nomination-request/entities/nomination-request.entity';
import { Race } from 'src/race/entities/race.entity';
import { Runner } from 'src/runner/entities/runner.entity';
import { RunnerAccuracyProfileView } from 'src/runner/entities/view/runner-accuracy-profile-view.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import {
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
import { Country } from '../../country/entity/country.entity';
import { HorseAccuracyProfileView } from './view/horse-accuracy-profile-view.entity';
import { RaceHorse } from 'src/race-horse/entities/race-horse.entity';

@Entity('tblHorse')
export class Horse extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  horseUuid: string;

  @Column({ type: 'varchar' })
  horseName: string;

  @Column({ nullable: true })
  sireId: number;

  @Column({ nullable: true })
  damId: number;

  @Column({ nullable: true })
  countryId: number;

  @Column({ nullable: true })
  colourId: number;

  @Column({ nullable: true })
  horseTypeId: number;

  @Column({ type: 'smallint', nullable: true })
  yob: number;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @Column({ type: 'char', nullable: true })
  sex: string;

  @Column({ default: false })
  gelding: boolean;

  @Column({ nullable: true })
  currencyId: number;

  @Column({ nullable: true, type: 'decimal', precision: 20, scale: 2 })
  totalPrizeMoneyEarned: number;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  verifiedBy: number;

  @Column({ nullable: true })
  verifiedOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @Column({ default: false })
  isArchived: boolean;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryId', referencedColumnName: 'id' })
  nationality: Country;

  @ManyToOne(() => Colour)
  @JoinColumn({ name: 'colourId', referencedColumnName: 'id' })
  colour: Colour;

  @OneToOne(() => Stallion, (stallion) => stallion.horse)
  stallion: Stallion;

  @ManyToOne(() => HorseType)
  @JoinColumn({ name: 'horseTypeId', referencedColumnName: 'id' })
  horsetype: HorseType;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;

  @OneToMany(() => Runner, (runner) => runner.horses)
  runners: Runner[];

  @OneToMany(() => Race, (runner) => runner.races)
  races: Race[];

  @ManyToOne(() => HorseType)
  @JoinColumn({ name: 'horseTypeId', referencedColumnName: 'id' })
  horseType: HorseType;

  @OneToOne(
    () => NominationRequest,
    (nominationRequest) => nominationRequest.mare,
  )
  mare: NominationRequest;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'sireId', referencedColumnName: 'id' })
  sire: Horse;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'damId', referencedColumnName: 'id' })
  dam: Horse;

  @OneToMany(
    () => FavouriteBroodmareSire,
    (favBroodmareSire) => favBroodmareSire.horse,
  )
  favBroodmareSire: FavouriteBroodmareSire[];

  @OneToMany(() => MemberMare, (favouriteMare) => favouriteMare.horse)
  favouriteMare: MemberMare[];

  @OneToMany(
    () => HorseAccuracyProfileView,
    (accuracyprofile) => accuracyprofile.horse,
  )
  accuracyprofile: HorseAccuracyProfileView[];

  @OneToMany(
    () => RunnerAccuracyProfileView,
    (runneraccuracyprofile) => runneraccuracyprofile.horse,
  )
  runneraccuracyprofile: RunnerAccuracyProfileView[];

  @OneToMany(() => RaceHorse, (raceHorse) => raceHorse.horse)
  raceHorse: RaceHorse[];
}
