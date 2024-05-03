import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Allow } from 'class-validator';
import { EntityHelper } from 'src/utils/entity-helper';

@Entity('tblMemberStatus')
export class MemberStatus extends EntityHelper {
  @ApiProperty()
  @PrimaryColumn()
  id: number;

  @Allow()
  @ApiProperty()
  @Column()
  statusName?: string;

  @OneToMany(() => MemberStatus, (status) => status.member)
  member: MemberStatus[];
}
