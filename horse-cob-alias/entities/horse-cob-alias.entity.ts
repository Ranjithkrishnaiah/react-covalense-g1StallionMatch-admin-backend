import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Horse } from 'src/horses/entities/horse.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import { Country } from 'src/country/entity/country.entity';

@Entity('tblHorseCobAlias')
export class HorseCobAlias extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  countryId: number;

  @Column({ nullable: true })
  horseId: number;

  @Column()
  isDefault: boolean;

  @Column()
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Horse)
  @JoinColumn({ name: 'horseId', referencedColumnName: 'id' })
  horse: Horse;

  @ManyToOne(() => Country, (countryId) => countryId.horseCobAlias)
  country: Country;
}
