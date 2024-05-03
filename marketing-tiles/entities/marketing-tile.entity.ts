import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblmarketingPageTilePermissions')
export class MarketingTiles {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  titlePermissionsUuid: string;

  @Column({ nullable: true })
  marketingPageId: number;

  @Column({ nullable: true })
  marketingPageSectionId: number;

  @Column()
  marketingPagePermissionTitle: string;

  @Column({ default: false, nullable: false })
  isAnonymous: boolean;

  @Column({ default: false, nullable: false })
  isRegistered: boolean;

  @Column()
  marketingPageTilePermissionsPosition: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn({ nullable: true })
  modifiedOn: Date;
}
export class MarketingTile {}
