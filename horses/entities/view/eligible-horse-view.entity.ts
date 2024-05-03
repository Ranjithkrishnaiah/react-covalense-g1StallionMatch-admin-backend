import { Runner } from 'src/runner/entities/runner.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  JoinColumn,
  ManyToOne,
  OneToMany,
  ViewColumn,
  ViewEntity
} from 'typeorm';

@ViewEntity({
  name: 'vwEligibleHorse',
})
export class EligibleHorseView extends EntityHelper {
  @ViewColumn()
  id: number;

  @ViewColumn()
  horseUuid: string;

  @ViewColumn()
  horseName: string;

  @ViewColumn()
  sireId: number;

  @ViewColumn()
  damId: number;

  @ViewColumn()
  countryId: number;

  @ViewColumn()
  colourId: number;

  @ViewColumn()
  horseTypeId: number;

  @ViewColumn()
  yob: number;

  @ViewColumn()
  dob: Date;

  @ViewColumn()
  sex: string;

  @ViewColumn()
  gelding: boolean;

  @ViewColumn()
  currencyId: number;

  @ViewColumn()
  totalPrizeMoneyEarned: number;

  @ViewColumn()
  isLocked: boolean;

  @ViewColumn()
  isActive: boolean;

  @ViewColumn()
  isVerified: boolean;

  @ViewColumn()
  createdBy: number;

  @ViewColumn()
  createdOn: Date;

  @ViewColumn()
  verifiedBy: number;

  @ViewColumn()
  verifiedOn: Date;

  @ViewColumn()
  modifiedBy: number;

  @ViewColumn()
  modifiedOn: Date;

  @ViewColumn()
  isArchived: boolean;

  @ManyToOne(() => Runner)
  @JoinColumn({ name: 'id', referencedColumnName: 'horseId' })
  vwHorses: Runner;
}
