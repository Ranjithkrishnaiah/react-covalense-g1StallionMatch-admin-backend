import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
} from 'typeorm';
import { FavouriteStallion } from './entities/favourite-stallion.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventSubscriber()
export class FavouriteStallionsSubscriber
  implements EntitySubscriberInterface<FavouriteStallion>
{
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return FavouriteStallion;
  }

  async afterInsert(event: InsertEvent<FavouriteStallion>) {
    this.eventEmitter.emit('addStallionToFavourite', event.entity);
  }
}
