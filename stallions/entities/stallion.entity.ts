import { Farm } from 'src/farms/entities/farm.entity';
import { FavouriteStallion } from 'src/favourite-stallions/entities/favourite-stallion.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { Member } from 'src/members/entities/member.entity';
import { NominationRequest } from 'src/nomination-request/entities/nomination-request.entity';
import { StallionLocation } from 'src/stallion-locations/entities/stallion-location.entity';
import { StallionPromotion } from 'src/stallion-promotions/entities/stallion-promotion.entity';
import { StallionServiceFee } from 'src/stallion-service-fees/entities/stallion-service-fee.entity';
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
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblStallion')
@Unique(['horseId', 'farmId'])
export class Stallion extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  stallionUuid: string;

  @Column({ nullable: true })
  horseId: number;

  @Column({ nullable: true })
  farmId: number;

  @Column()
  url: string;

  @Column()
  yearToStud: number;

  @Column()
  yearToRetired: number;

  @Column()
  height: string;

  @Column()
  overview: String;

  @Column()
  reasonId: number;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isActive: boolean;

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

  @Column({ default: true })
  isRemoved: boolean;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'id' })
  farm: Farm;

  @OneToOne(() => Horse)
  @JoinColumn({ name: 'horseId', referencedColumnName: 'id' })
  horse: Horse;

  @OneToMany(
    () => StallionServiceFee,
    (stallionservicefee) => stallionservicefee.stallion,
  )
  stallionservicefees: StallionServiceFee[];

  @OneToOne(
    () => StallionLocation,
    (stallionlocation) => stallionlocation.stallion,
  )
  stallionlocation: StallionLocation;

  @OneToOne(
    () => StallionServiceFee,
    (stallionservicefee) => stallionservicefee.stallion,
  )
  stallionservicefee: StallionServiceFee;

  @OneToMany(
    () => StallionPromotion,
    (stallionpromotions) => stallionpromotions.stallion,
  )
  stallionpromotion: StallionPromotion[];

  @OneToMany(
    () => FavouriteStallion,
    (favouriteStallion) => favouriteStallion.stallion,
  )
  favouriteStallion: FavouriteStallion[];

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  member: Member;

  @OneToMany(() => Member, (member) => member.stallion)
  members: Member[];

  @OneToOne(
    () => NominationRequest,
    (nominationRequest) => nominationRequest.stallion,
  )
  stallion: NominationRequest;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'modifiedBy', referencedColumnName: 'id' })
  modifiedby: Member;
}
