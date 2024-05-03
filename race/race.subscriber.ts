import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  LoadEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { SoftRemoveEvent } from 'typeorm/subscriber/event/SoftRemoveEvent';
import { Race } from './entities/race.entity';

@EventSubscriber()
export class RaceSubscriber implements EntitySubscriberInterface<Race> {
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  race: Race;
  dataList = [];

  listenTo() {
    return Race;
  }

  async beforeInsert(event: InsertEvent<Race>) {}

  async afterInsert(event: InsertEvent<Race>) {
    this.eventEmitter.emit('createRace', event.entity);
  }

  async afterLoad(entity: Race, event?: LoadEvent<Race>) {
    this.race = entity;
  }

  async beforeRemove(event: RemoveEvent<Race>) {}

  afterRemove(event: RemoveEvent<Race>) {}

  beforeSoftRemove(event: SoftRemoveEvent<Race>) {}

  afterSoftRemove(event: SoftRemoveEvent<Race>) {}
  public async afterUpdate(event: UpdateEvent<Race>) { 
    let objectKeys = Object.keys(this.dataList[0]);
    //Try entity manger to get original entity;
  //  let objectKeys = Object.keys(this.race);
 
    // objectKeys.forEach((column) => {
    //   let key: string = column;
    //   let oldValue = this.dataList[0][column];
    //   let newValue = event.entity[column];

    //   if (key == 'isEligible' && oldValue != newValue) {
    //     this.eventEmitter.emit('updateRaceDetailsActivity', {
    //       key: key,
    //       oldValue: oldValue,
    //       newValue: newValue,
    //     });
    //   }
    //   if (oldValue != newValue && newValue) {
    //     this.eventEmitter.emit('updateRaceDetailsActivity', {
    //       key: key,
    //       oldValue: oldValue,
    //       newValue: newValue,
    //     });
    //   }
    // });
  }

  beforeUpdate(event: UpdateEvent<Race>) {
    let entity: Race = event.entity as Race;
    this.race = entity;

    this.dataList.push(entity);
  }
}
