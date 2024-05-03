import * as bcrypt from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { ActivityEntity } from 'src/activity-module/activity.entity';
import { AuthProvidersEnum } from 'src/auth/auth-providers.enum';
import { FarmLocation } from 'src/farm-locations/entities/farm-location.entity';
import { FavouriteBroodmareSire } from 'src/favourite-broodmare-sires/entities/favourite-broodmare-sire.entity';
import { FavouriteFarm } from 'src/favourite-farms/entities/favourite-farm.entity';
import { FavouriteStallion } from 'src/favourite-stallions/entities/favourite-stallion.entity';
import { Horse } from 'src/horses/entities/horse.entity';
import { MemberAddress } from 'src/member-address/entities/member-address.entity';
import { MemberFarm } from 'src/member-farms/entities/member-farm.entity';
import { MemberMare } from 'src/member-mares/entities/member-mare.entity';
import { MemberProfileImage } from 'src/member-profile-image/entities/member-profile-image.entity';
import { MemberStatus } from 'src/member-status/entities/member-status.entity';
import { OrderProduct } from 'src/order-product/entities/order-product.entity';
import { PreferedNotification } from 'src/prefered-notification/entities/prefered-notification.entity';
import { Role } from 'src/role/entities/role.entity';
import { SocialLink } from 'src/social-links/entities/social-link.entity';
import { SocialShare } from 'src/social-share/entities/social-share.entity';
import { StallionServiceFee } from 'src/stallion-service-fees/entities/stallion-service-fee.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '../../statuses/entities/status.entity';
import { RaceHorse } from 'src/race-horse/entities/race-horse.entity';

@Entity('tblMember')
export class Member extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  memberuuid: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'varchar' })
  fullName: string;

  @Column({ nullable: true })
  isActive: boolean;

  @Column({ nullable: true })
  isVerified: boolean;

  @Column({ nullable: true })
  paymentMethodId: number;

  @Column({ nullable: true })
  statusId: number;

  @Column({ nullable: true })
  sso: boolean;

  public previousPassword: string;

  @AfterLoad()
  public loadPreviousPassword(): void {
    this.previousPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async setPassword() {
    if (this.previousPassword !== this.password && this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @Column({ default: AuthProvidersEnum.email })
  provider: string;

  @Index()
  @Column({ nullable: true })
  socialId: string | null;

  @Column({ nullable: true })
  socialLinkId: Number;

  @Column({ nullable: false })
  roleId: number;

  @ManyToOne(() => Status, {
    eager: true,
  })
  status?: Status;

  @Column({ nullable: true })
  @Index()
  hash: string | null;

  @Column({ nullable: true })
  @Exclude()
  hashedRefreshToken: string;

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn()
  modifiedOn: Date;

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  modifiedBy: number;

  @DeleteDateColumn()
  deletedOn: Date;

  @Column({ nullable: true, type: 'datetime2' })
  lastActive: Date;

  @Column({ nullable: true })
  isArchived: boolean;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ nullable: true, type: 'datetime2' })
  suspendedOn: Date;

  @OneToMany(() => FarmLocation, (farmlocation) => farmlocation.createdby)
  farmlocationscreatedby: FarmLocation[];

  @OneToMany(() => FarmLocation, (farmlocation) => farmlocation.modifiedby)
  farmlocationsmodifiedby: FarmLocation[];

  @OneToMany(() => MemberAddress, (memberaddress) => memberaddress.member)
  memberaddresses: MemberAddress[];

  @OneToMany(() => Stallion, (stallion) => stallion.member)
  stallion: Stallion[];

  @ManyToOne(() => MemberStatus)
  @JoinColumn({ name: 'statusId', referencedColumnName: 'id' })
  memberStatus: MemberStatus;

  @ManyToOne(() => SocialLink)
  @JoinColumn({ name: 'socialLinkId', referencedColumnName: 'id' })
  @OneToMany(() => Horse, (horse) => horse.member)
  horse: Stallion[];

  @OneToMany(
    () => FavouriteStallion,
    (favouritestallions) => favouritestallions.member,
  )
  favouritestallions: FavouriteStallion[];

  @OneToMany(() => FavouriteFarm, (favouritefarms) => favouritefarms.member)
  favouritefarms: FavouriteFarm[];

  @OneToMany(
    () => FavouriteBroodmareSire,
    (FavouritebroodmareSire) => FavouritebroodmareSire.member,
  )
  favouritebroodmareSire: FavouriteBroodmareSire[];

  @OneToMany(() => MemberMare, (favouritemare) => favouritemare.member)
  favouritemares: MemberMare[];

  @OneToMany(
    () => PreferedNotification,
    (preferedNotification) => preferedNotification.member,
  )
  preferedNotification: PreferedNotification[];

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.member)
  orderProduct: OrderProduct[];

  @OneToMany(
    () => MemberProfileImage,
    (memberprofileimage) => memberprofileimage.member,
  )
  memberprofileimages: MemberProfileImage[];

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId', referencedColumnName: 'Id' })
  roles: Role;

  @OneToMany(() => MemberFarm, (memberfarm) => memberfarm.member)
  memberfarms: MemberFarm[];

  @OneToMany(() => StallionServiceFee, (fee) => fee.member)
  StallionServiceFee: StallionServiceFee[];

  @OneToMany(() => ActivityEntity, (activity) => activity.member)
  activity: ActivityEntity[];

  @ManyToOne(() => SocialShare)
  @JoinColumn({ name: 'id', referencedColumnName: 'createdBy' })
  searchShare: SocialShare;

  @OneToMany(() => RaceHorse, (raceHorse) => raceHorse.member)
  raceHorse: RaceHorse[];
}
