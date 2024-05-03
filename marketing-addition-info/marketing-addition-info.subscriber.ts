import {
  EventSubscriber,
  EntitySubscriberInterface,
  Connection,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { MarketingAdditonInfo } from './entities/marketing-addition-info.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventSubscriber()
export class MarketingAdditionalInfoSubscriber
  implements EntitySubscriberInterface<MarketingAdditonInfo>
{
  constructor(
    private readonly connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {
    connection.subscribers.push(this);
  }

  marketingAdditionalInfo: MarketingAdditonInfo;
  dataList = [];
  listenTo() {
    return MarketingAdditonInfo;
  }

  async afterInsert(event: InsertEvent<MarketingAdditonInfo>) {
    this.eventEmitter.emit('marketingInfoTestimonial', event.entity);
  }

  async afterLoad(entity: MarketingAdditonInfo) {
    this.marketingAdditionalInfo = entity;
  }

  public async beforeUpdate(event: UpdateEvent<MarketingAdditonInfo>) {
    let entity: MarketingAdditonInfo = event.entity as MarketingAdditonInfo;
    this.marketingAdditionalInfo = entity;

    this.dataList.push(this.marketingAdditionalInfo);
  }

  async afterUpdate(event: UpdateEvent<MarketingAdditonInfo>) {
    let objectKeys = Object.keys(this.dataList[0]);
    objectKeys.forEach((column) => {
      let key: string = column;
      let oldValue = this.dataList[0][column];
      let newValue = event.entity[column];
      if (oldValue != newValue && newValue) {
        this.eventEmitter.emit('updateMarketingTestimonialAdditionalInfo', {
          key: key,
          oldValue: oldValue,
          newValue: newValue,
          farmUuid: this.marketingAdditionalInfo.marketingPageAdditionInfoUuid,
        });
      }
    });
  }
}
