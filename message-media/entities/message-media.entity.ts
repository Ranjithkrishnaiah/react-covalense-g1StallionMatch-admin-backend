import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { Media } from 'src/media/entities/media.entity';
import { Messages } from 'src/messages/entities/messages.entity';

@Entity('tblMessageMedia')
export class MessageMedia extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  messageId: number;

  @Column({ nullable: true })
  mediaId: number;

  @ManyToOne(() => Messages)
  @JoinColumn({ name: 'messageId', referencedColumnName: 'id' })
  message: Messages;

  @ManyToOne(() => Media)
  @JoinColumn({ name: 'mediaId', referencedColumnName: 'id' })
  media: Media;
}
