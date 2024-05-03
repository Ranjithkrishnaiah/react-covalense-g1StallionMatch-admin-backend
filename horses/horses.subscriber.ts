import {
  Connection,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  LoadEvent,
  UpdateEvent,
} from 'typeorm';

import { EventEmitter2 } from '@nestjs/event-emitter';
import { format } from 'date-fns';
import { Horse } from './entities/horse.entity';

@EventSubscriber()
export class HorsesSubscriber implements EntitySubscriberInterface<Horse> {
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  horse: Horse; // previouse entity or current entity

  listenTo() {
    return Horse;
  }

  async afterInsert(event: InsertEvent<Horse>) {
    let createEntity = event.entity;
    this.eventEmitter.emit('createHorse', createEntity);
  }

  async afterLoad(entity: Horse, event?: LoadEvent<Horse>) {
    this.horse = entity;
  }

  async afterUpdate(event: UpdateEvent<Horse>): Promise<any> {
    let objectKeys = Object.keys(this.horse);
    let horseName = this.horse['horseName'];
    let modifiedData = [];
    objectKeys.forEach((column) => {
      let key: string = column;
      let oldValue = this.horse[column];
      let newValue = event.entity[column];
      if (key == 'dob' && oldValue && newValue) {
        oldValue = format(new Date(oldValue), 'dd MMM yyyy');
        newValue = format(new Date(newValue), 'dd MMM yyyy');
      }
      if (oldValue != newValue && newValue != null) {
        this.eventEmitter.emit('updateHorse', {
          key: key,
          oldValue: oldValue,
          newValue: newValue,
          horseUuid: this.horse.horseUuid,
        });
        switch (key) {
          case 'horseName':
            modifiedData.push({
              key: key,
              horseName: newValue,
              oldValue: oldValue,
              newValue: newValue,
            });
            break;
          case 'gelding':
            modifiedData.push({
              key: key,
              horseName: horseName,
              oldValue: oldValue ? 'Yes' : 'No',
              newValue: newValue ? 'Yes' : 'No',
            });
            break;
          case 'sex':
            modifiedData.push({
              key: key,
              horseName: horseName,
              oldValue: oldValue == 'M' ? 'Male' : 'Female',
              newValue: newValue == 'M' ? 'Male' : 'Female',
            });
            break;
          case 'yob':
            modifiedData.push({
              key: key,
              horseName: horseName,
              oldValue: oldValue,
              newValue: newValue,
            });
            break;
          case 'countryId':
            modifiedData.push({
              key: 'country',
              horseName: horseName,
              oldValue: oldValue,
              newValue: newValue,
            });
            break;
          case 'colourId':
            modifiedData.push({
              key: 'colour',
              horseName: horseName,
              oldValue: oldValue,
              newValue: newValue,
            });
            break;
          case 'horseTypeId':
            modifiedData.push({
              key: 'horseBreed',
              horseName: horseName,
              oldValue: oldValue,
              newValue: newValue,
            });
            break;
          case 'dob':
            modifiedData.push({
              key: 'dob',
              horseName: horseName,
              oldValue: oldValue,
              newValue: newValue,
            });
            break;
          case 'totalPrizeMoneyEarned':
            modifiedData.push({
              key: 'prizemoney',
              horseName: horseName,
              oldValue: oldValue,
              newValue: newValue,
            });
            break;
          case 'isLocked':
            modifiedData.push({
              key: 'locked',
              horseName: horseName,
              oldValue: oldValue ? 'Yes' : 'No',
              newValue: newValue ? 'Yes' : 'No',
            });
            break;
          case 'currencyId':
            modifiedData.push({
              key: 'prizemoney currency',
              horseName: horseName,
              oldValue: oldValue,
              newValue: newValue,
            });
            break;
          default:
        }
      }
    });
    this.eventEmitter.emit('updateHorseActivity', modifiedData);
  }
}
