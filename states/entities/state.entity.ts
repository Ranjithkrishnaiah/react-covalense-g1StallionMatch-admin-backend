import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Country } from '../../country/entity/country.entity';
import { FarmLocation } from '../../farm-locations/entities/farm-location.entity';
import { EntityHelper } from '../../utils/entity-helper';

@Entity('tblState')
export class State extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  stateName: string;

  @Column({ nullable: true })
  stateCode: string;

  @Column({ default: true })
  isDisplay: boolean;

  @Column({ nullable: true })
  countryId: number;

  @ManyToOne(() => Country, (countryId) => countryId.states)
  country: Country;

  @OneToMany(() => FarmLocation, (farmlocation) => farmlocation.state)
  farmlocations: FarmLocation[];
}
