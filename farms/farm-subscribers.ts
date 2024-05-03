import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Farm } from './entities/farm.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventSubscriber()
export class FarmSubscriber implements EntitySubscriberInterface<Farm> {
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  farm: Farm;

  listenTo() {
    return Farm;
  }

  async afterInsert(event: InsertEvent<Farm>) {
    this.eventEmitter.emit('createFarm', event.entity);
    // farmId, statllioId --> stallionAuidt --> same
  }

  async afterLoad(entity: Farm) {
    this.farm = entity;
  }

  async afterUpdate(event: UpdateEvent<Farm>) {
    let objectKeys = Object.keys(this.farm);

    objectKeys.forEach((column) => {
      let key: string = column;
      let oldValue = this.farm[column];
      let newValue = event.entity[column];

      if (oldValue != newValue && newValue) {
        this.eventEmitter.emit('updateAuditFarm', {
          key: key,
          oldValue: oldValue,
          newValue: newValue,
          farmUuid: this.farm.farmUuid,
        });
        if (key == 'farmName') {
          this.eventEmitter.emit('updateActivityFarm', {
            key: key,
            oldValue: oldValue,
            newValue: newValue,
          });
        }
      }
    });
  }
}
