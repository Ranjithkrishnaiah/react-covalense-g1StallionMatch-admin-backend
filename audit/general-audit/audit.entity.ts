import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tblAudit')
export class AuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  entityId: number;

  @Column()
  ipAddress: string;

  @Column('simple-json', { nullable: true })
  entityValue: string;

  @Column()
  activityType: number;

  @Column({ nullable: true })
  createdBy: number;

  @Column()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;

  @Column()
  modifiedOn: Date;

  @Column()
  entity: number;
}
