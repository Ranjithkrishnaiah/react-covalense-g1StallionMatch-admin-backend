import { ApiProperty } from '@nestjs/swagger';
import { Farm } from 'src/farms/entities/farm.entity';
import { Member } from 'src/members/entities/member.entity';
import { MessageRecipient } from 'src/message-recepient/entities/message-recipient.entity';
import { Stallion } from 'src/stallions/entities/stallion.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { NominationRequest } from 'src/nomination-request/entities/nomination-request.entity';
import { MessageMedia } from 'src/message-media/entities/message-media.entity';

@Entity('tblMessage')
export class Messages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  fromMemberId: number;

  @Column({ nullable: true })
  nominationRequestId: number;

  @Column({ nullable: true })
  stallionId: number;

  @Column({ nullable: true })
  subject: string;

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  farmId: number;

  @Column({ nullable: true })
  mareId: number;

  @Column()
  isActive: boolean;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  fromName: string;

  @Column({ nullable: true })
  mareName: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  cob: number;

  @Column()
  yob: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @UpdateDateColumn()
  modifiedOn: Date;

  @ManyToOne(() => Farm)
  @JoinColumn({ name: 'farmId', referencedColumnName: 'id' })
  farm: Farm;

  @ManyToOne(() => Stallion)
  @JoinColumn({ name: 'stallionId', referencedColumnName: 'id' })
  stallion: Stallion;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
  sender: Member;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'fromMemberId', referencedColumnName: 'id' })
  fromMember: Member;

  @ManyToOne(() => NominationRequest)
  @JoinColumn({ name: 'nominationRequestId', referencedColumnName: 'id' })
  nominationRequest: NominationRequest;

  @OneToMany(
    () => MessageRecipient,
    (messagerecipient) => messagerecipient.message,
  )
  messagerecipient: MessageRecipient[];

  @OneToMany(() => MessageMedia, (messagemedia) => messagemedia.message)
  messagemedia: MessageMedia[];
}
