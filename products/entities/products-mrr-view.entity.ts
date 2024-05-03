import { ViewEntity, ViewColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@ViewEntity({
  name: 'vwProductsMRR',
})
export class ProductsMRRView {
  @ViewColumn()
  productId: number;

  @ViewColumn()
  MRR: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
  product: Product;
}
