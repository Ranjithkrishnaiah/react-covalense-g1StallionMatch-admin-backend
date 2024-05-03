import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { Runner } from './entities/runner.entity';

@EventSubscriber()
export class RunnerSubscriber implements EntitySubscriberInterface<Runner> {
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  runner: Runner;
  dataList = [];

  listenTo() {
    return Runner;
  }

  async afterInsert(event: InsertEvent<Runner>) {
    this.eventEmitter.emit('createRunner', event.entity);
  }

  async beforeInsert(entity: InsertEvent<Runner>) {}

  async beforeRemove(event: RemoveEvent<Runner>) {}

  async afterRemove(event: RemoveEvent<Runner>) {}

  async afterLoad(entity: Runner) {
    this.runner = entity;
  }

  async afterUpdate(event: UpdateEvent<Runner>) {
    let objectKeys = Object.keys(this.dataList[0]);

    objectKeys.forEach((column) => {
      let key: string = column;
      let oldValue = this.dataList[0][column];
      let newValue = event.entity[column];
      if (key == 'isEligible' && oldValue != newValue) {
        this.eventEmitter.emit('updateActivityRunner', {
          key: key,
          oldValue: oldValue,
          newValue: newValue,
        });
      } else if (oldValue != newValue && newValue) {
      }
    });
  }

  public async beforeUpdate(event: UpdateEvent<Runner>) {
    let entity: Runner = event.entity as Runner;
    this.dataList.push(entity);
  }
}
