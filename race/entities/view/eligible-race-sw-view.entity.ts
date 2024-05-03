import { Runner } from 'src/runner/entities/runner.entity';
import {
  BaseEntity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  ViewColumn,
  ViewEntity
} from 'typeorm';

@ViewEntity({
  name: 'vwEligibleRaceStakesWinner',
})
export class EligibleRaceSwView extends BaseEntity {
  @ViewColumn()
  id: number;

  @ViewColumn()
  raceUuid: string;

  @ViewColumn()
  sourceId: number;

  @ViewColumn()
  raceDate: Date;

  @ViewColumn()
  raceTime: string;

  @ViewColumn()
  venueId: number;

  @ViewColumn()
  trackTypeId: number;

  @ViewColumn()
  trackConditionId: number;

  @ViewColumn()
  displayName: string;

  @ViewColumn()
  importedName: string;

  @ViewColumn()
  raceDistance: number;

  @ViewColumn()
  distanceUnitId: number;

  @ViewColumn()
  raceAgeRestrictionId: number;

  @ViewColumn()
  raceSexRestrictionId: number;

  @ViewColumn()
  raceClassId: number;

  @ViewColumn()
  raceStakeId: number;

  @ViewColumn()
  raceNumber: number;

  @ViewColumn()
  currencyId: number;

  @ViewColumn()
  racePrizemoney: number;

  @ViewColumn()
  raceTypeId: number;

  @ViewColumn()
  raceWeatherId: number;

  @ViewColumn()
  raceStatusId: number;

  @ViewColumn()
  isEligible: boolean;

  @ViewColumn()
  createdBy: number;

  @ViewColumn()
  createdOn: Date;

  @ViewColumn()
  modifiedBy: number;

  @ViewColumn()
  modifiedOn: Date;

  @ManyToOne(() => Runner)
  @JoinColumn({ name: 'id', referencedColumnName: 'raceId' })
  vwSwraces: Runner;
}
