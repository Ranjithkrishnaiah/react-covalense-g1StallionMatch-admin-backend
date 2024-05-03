import { StallionTestimonialMedia } from 'src/stallion-testimonial-media/entities/stallion-testimonial-media.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import { EntityHelper } from 'src/utils/entity-helper';
import {
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

@Entity('tblStallionTestimonial')
export class StallionTestimonial extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  @Generated('uuid')
  stallionTestimonialUuid: string;

  @Column({ nullable: true })
  stallionId: number;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  company: string;

  @Column({ type: 'text', nullable: true })
  description: string;

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

  @Column({ nullable: true })
  deletedBy: number;

  @DeleteDateColumn()
  deletedOn: Date;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;

  @OneToMany(
    () => StallionTestimonialMedia,
    (stalliontestimonials) => stalliontestimonials.stalliontestimonial,
  )
  stalliontestimonialmedia: StallionTestimonialMedia[];
}
