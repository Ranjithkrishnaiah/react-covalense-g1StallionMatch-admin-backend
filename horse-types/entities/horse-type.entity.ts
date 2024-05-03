import { Horse } from 'src/horses/entities/horse.entity';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('tblHorseBreed')
export class HorseType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  horseTypeName: string;

  @OneToMany(() => Horse, (horse) => horse.horsetype)
  horses: Horse[];
}
