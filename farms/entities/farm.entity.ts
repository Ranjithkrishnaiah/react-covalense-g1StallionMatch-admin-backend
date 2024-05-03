import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { FarmLocation } from 'src/farm-locations/entities/farm-location.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { MemberFarm } from 'src/member-farms/entities/member-farm.entity';
import { FarmGalleryImage } from 'src/farm-gallery-images/entities/farm-gallery-image.entity';
import { FarmMediaInfo } from 'src/farm-media-info/entities/farm-media-info.entity';
import { NominationRequest } from 'src/nomination-request/entities/nomination-request.entity';

@Entity('tblFarm')
export class Farm extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  farmUuid: string;

  @Column({ type: 'varchar' })
  farmName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ type: 'text', nullable: true })
  overview: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  //Enable This
  @Column({ nullable: true })
  verifiedBy: number;

  @CreateDateColumn()
  verifiedOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @OneToOne(() => FarmLocation, (farmlocation) => farmlocation.farm)
  farmlocations: FarmLocation[];

  @OneToMany(() => Stallion, (stallion) => stallion.farm)
  stallions: Stallion[];

  @OneToMany(() => MemberFarm, (memberfarm) => memberfarm.farm)
  memberfarms: MemberFarm[];

  @OneToMany(
    () => FarmGalleryImage,
    (farmgalleryimage) => farmgalleryimage.farm,
  )
  farmgalleryimages: FarmGalleryImage[];

  @OneToMany(() => FarmMediaInfo, (farmmedia) => farmmedia.farm)
  farmmediainfo: FarmMediaInfo[];

  @OneToOne(
    () => NominationRequest,
    (nominationRequest) => nominationRequest.farm,
  )
  farm: NominationRequest;
}
