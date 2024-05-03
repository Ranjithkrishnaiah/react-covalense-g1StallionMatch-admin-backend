import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  UpdateEvent,
  createConnection,
  RemoveEvent,
  LoadEvent,
} from 'typeorm';
import { Product } from './entities/product.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventSubscriber()
export class ProductsSubscriber implements EntitySubscriberInterface<Product> {
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  product: Product;

  listenTo() {
    return Product;
  }

  async afterInsert(event: InsertEvent<Product>) {
    this.eventEmitter.emit('createProduct', event.entity);
  }

  async afterLoad(entity: Product) {
    this.product = entity;
  }

  async afterUpdate(event: UpdateEvent<Product>) {
    let objectKeys = Object.keys(this.product);

    objectKeys.forEach((column) => {
      let key: string = column;
      let oldValue = this.product[column];
      let newValue = event.entity[column];
      if (key == 'isActive' && oldValue != newValue) {
        this.eventEmitter.emit('updateActivityProduct', {
          key: key,
          oldValue: oldValue,
          newValue: newValue,
        });
      } else if (oldValue != newValue && newValue) {
      }
    });
  }

  public async beforeUpdate(event: UpdateEvent<Product>) {
    let entity: Product = event.entity as Product;
    this.product = entity;
  }
}
