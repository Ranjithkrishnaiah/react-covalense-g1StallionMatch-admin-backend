import { Country } from 'src/country/entity/country.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblCurrency')
@Unique(['currencyName', 'currencyCode'])
export class Currency extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  currencyName: string;

  @Column()
  currencyCode: string;

  @CreateDateColumn({ select: false })
  createdOn: Date;

  @Column()
  currencySymbol: string;

  @UpdateDateColumn({ default: null, nullable: true, select: false })
  modifiedOn: Date;

  @Column({ nullable: true })
  createdBy: Number;

  @Column({ nullable: true })
  modifiedBy: Number;

  @OneToMany(() => Country, (country) => country.currency)
  countries: Country[];

  @OneToMany(() => Horse, (horse) => horse.currency)
  horses: Horse[];
}
