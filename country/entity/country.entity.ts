import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { State } from '../../states/entities/state.entity';
import { FarmLocation } from '../../farm-locations/entities/farm-location.entity';
import { Horse } from '../../horses/entities/horse.entity';
import { Region } from 'src/regions/entities/region.entity';
import { Currency } from 'src/currencies/entities/currency.entity';
import { Venue } from 'src/venue/entities/venue.entity';
import { HorseCobAlias } from 'src/horse-cob-alias/entities/horse-cob-alias.entity';

@Entity('tblCountry')
@Unique(['countryName'])
export class Country extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  countryName: string;

  @Column()
  countryCode: string;

  @Column()
  countryA2Code: string;

  @Column({ nullable: true })
  regionId: number;

  @Column({ nullable: true })
  preferredCurrencyId: number;

  @Column({ default: true })
  isDisplay: boolean;

  @Column({ default: false })
  blackListFromAdminPortal: boolean;

  @Column({ default: false })
  isEligibleRaceCountry: boolean;

  @Column({ type: 'decimal', default: null })
  latitude: number;

  @Column({ type: 'decimal', default: null })
  longitude: number;

  @CreateDateColumn({ select: false })
  createdOn: Date;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;

  @OneToMany(() => State, (state) => state.country)
  states: State[];

  @OneToMany(() => FarmLocation, (farmlocation) => farmlocation.country)
  farmlocations: FarmLocation[];

  @OneToMany(() => Horse, (horse) => horse.nationality)
  horses: Horse[];

  @ManyToOne(() => Region)
  @JoinColumn({ name: 'regionId', referencedColumnName: 'id' })
  region: Region;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'preferredCurrencyId', referencedColumnName: 'id' })
  currency: Currency;

  @OneToMany(() => Venue, (venue) => venue.country)
  venues: Venue[];

  @OneToMany(() => HorseCobAlias, (cob) => cob.country)
  horseCobAlias: HorseCobAlias[];
}
