import { Category } from 'src/categories/entities/categories.entity';
import { Currency } from 'src/currencies/entities/currency.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';
import { ProductsMRRView } from './products-mrr-view.entity';

@Entity('tblProduct')
export class Product extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  categoryId: number;

  @Column({ nullable: true })
  productName: string;

  @Column({ nullable: true })
  productCode: string;

  @Column()
  price: number;

  @Column({ nullable: true })
  currencyId: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdOn: Date;

  @Column({ nullable: true })
  modifiedBy: number;
  
  @Column({ nullable: true })
  marketingPageInfoId: number;

  @UpdateDateColumn()
  modifiedOn: Date;
  
  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId', referencedColumnName: 'id' })
  category: Category;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currencyId', referencedColumnName: 'id' })
  currency: Currency;
  
  @OneToMany(
    () => ProductsMRRView,
    (productsMRRView) => productsMRRView.product,
  )
  productsMRRView: ProductsMRRView[];
}
