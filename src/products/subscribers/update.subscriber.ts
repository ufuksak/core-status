import {Injectable} from '@nestjs/common';
import {InjectConnection} from '@nestjs/typeorm';
import {Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent} from 'typeorm';
import {UpdateEntity} from "../entity/update.entity";
import {SubscribersService} from "../services/subscribers.service";


@Injectable()
@EventSubscriber()
export class UpdateSubscriber implements EntitySubscriberInterface<UpdateEntity> {
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly subscribersService: SubscribersService
  ) {
    connection.subscribers.push(this);
  }

  listenTo() {
    return UpdateEntity;
  }

  async afterInsert(event: InsertEvent<UpdateEntity>) {
    const {entity} = event;
    await this.subscribersService.pushToWorker(entity);
  }
}
