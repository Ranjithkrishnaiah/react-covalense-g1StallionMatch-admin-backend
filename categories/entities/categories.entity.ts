import { Product } from 'src/products/entities/product.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';

@Entity('tblCategory')
export class Category extends EntityHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  categoryName: string;

  @CreateDateColumn()
  createdOn: Date;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
