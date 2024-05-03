import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tblStallionReason')
@Unique(['reasonName'])
export class StallionRetiredReasons extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reasonName: string;

  // @Column({ default: true })
  // isActive: boolean;

  // @CreateDateColumn({ select: false })
  // createdOn: Date;

  // @Column()
  // createdBy: number;

  // @UpdateDateColumn({ default: null, nullable: true, select: false })
  // modifiedOn: Date;

  // @Column()
  // modifiedBy: number;
}
