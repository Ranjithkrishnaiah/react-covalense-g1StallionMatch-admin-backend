import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent
} from 'typeorm';
import { PromoCode } from './entities/promo-code.entity';

@EventSubscriber()
export class PromoCodesSubscriber
  implements EntitySubscriberInterface<PromoCode>
{
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  promoCode: PromoCode;

  listenTo() {
    return PromoCode;
  }

  async afterInsert(event: InsertEvent<PromoCode>) {
    this.eventEmitter.emit('createPromoCode', event.entity);
  }

  async beforeInsert(entity: InsertEvent<PromoCode>) {}

  async beforeRemove(event: RemoveEvent<PromoCode>) {}

  async afterRemove(event: RemoveEvent<PromoCode>) {}

  async afterLoad(entity: PromoCode) {
    this.promoCode = entity;
  }

  async afterUpdate(event: UpdateEvent<PromoCode>) {
    let objectKeys = Object.keys(this.promoCode);

    objectKeys.forEach((column) => {
      let key: string = column;
      let oldValue = this.promoCode[column];
      let newValue = event.entity[column];
      if (key == 'isActive' && oldValue != newValue) {
        this.eventEmitter.emit('updateActivityPromoCode', {
          key: key,
          oldValue: oldValue,
          newValue: newValue,
        });
      } else if (oldValue != newValue && newValue) {
      }
    });
  }

  public async beforeUpdate(event: UpdateEvent<PromoCode>) {}
}
