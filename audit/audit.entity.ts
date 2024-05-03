import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tblAuditGeneral')
export class AuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  activityType: number;

  @Column()
  entityId: string;

  @Column()
  attributeName: string;
  // Coloumn name

  @Column()
  newValue: string;

  @Column()
  oldValue: string;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column({ nullable: true })
  createdBy: number;

  @Column()
  createdOn: Date;

  @Column()
  entity: string;
}
