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
import { Member } from './entities/member.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { identifier } from 'aws-sdk/clients/frauddetector';

@EventSubscriber()
export class MemberSubscriber implements EntitySubscriberInterface<Member> {
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  member: Member;

  listenTo() {
    return Member;
  }

  async beforeInsert(event: InsertEvent<Member>) {}

  async afterInsert(event: InsertEvent<Member>) {
    this.eventEmitter.emit('createMember', event.entity);
  }

  async beforeRemove(event: RemoveEvent<Member>) {}

  async afterRemove(event: RemoveEvent<Member>) {}

  async afterLoad(entity: Member, event?: LoadEvent<Member>) {
    this.member = entity;
  }

  async afterUpdate(event: UpdateEvent<Member>) {
    // this is happing only save()
    let objectKeys = Object.keys(this.member);

    objectKeys.forEach((column) => {
      let key: string = column;
      let oldValue = this.member[column];
      let newValue = event.entity[column];

      if (oldValue != newValue && newValue) {
      }
    });
  }
}
