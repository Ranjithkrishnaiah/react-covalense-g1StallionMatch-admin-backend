import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  LoadEvent,
  UpdateEvent
} from 'typeorm';
import { Stallion } from './entities/stallion.entity';

@EventSubscriber()
export class StallionsSubscriber
  implements EntitySubscriberInterface<Stallion>
{
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  stallion: Stallion;

  listenTo() {
    return Stallion;
  }

  async afterInsert(event: InsertEvent<Stallion>) {
    this.eventEmitter.emit('createStallion', event.entity);
  }

  async afterLoad(entity: Stallion, event?: LoadEvent<Stallion>) {
    this.stallion = entity;
  }O

  public async afterUpdate(event: UpdateEvent<Stallion>) {
    let objectKeys = Object.keys(this.stallion);
    objectKeys.forEach((column) => {
      let key: string = column;
      let oldValue = this.stallion[column];
      let newValue = event.entity[column];
      if (oldValue != newValue && newValue) {
        this.eventEmitter.emit('updateStallion', {
          key: key,
          oldValue: oldValue,
          newValue: newValue,
          stallionUuid: this.stallion.stallionUuid,
        });
      }
    });
  }
}
