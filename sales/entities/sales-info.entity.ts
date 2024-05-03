// import { Salestype } from 'src/sales-type/entities/sales-type.entity';
// import { EntityHelper } from 'src/utils/entity-helper';
// import {
//   Column,
//   CreateDateColumn,
//   Entity,
//   Index,
//   JoinColumn,
//   ManyToOne,
//   PrimaryGeneratedColumn,
//   UpdateDateColumn,
// } from 'typeorm';

// @Entity('tblSalesInfo')
// export class SalesInfo extends EntityHelper {
//   @PrimaryGeneratedColumn()
//   Id: number;

//   @Index({ unique: true })
//   @Column()
//   salesInfoName: string;

//   @Column({ type: 'int', nullable: true })
//   salesTypeId: number;
  
//   @Column({ type: 'int', nullable: true })
//   countryId: number;

//   @Column({ type: 'varchar' })
//   description: string;

//   @CreateDateColumn()
//   createdOn: Date;
  
//   @Column({ nullable: true })
//   createdBy: number;

//   @Column({ nullable: true })
//   modifiedBy: number;

//   @UpdateDateColumn()
//   modifiedOn: Date;

//   @ManyToOne(() => Salestype)
//   @JoinColumn({ name: 'salesTypeId', referencedColumnName: 'Id' })
//   salesType: Salestype;

// }
