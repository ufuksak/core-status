import {
  EventSubscriber,
  EntitySubscriberInterface,
  UpdateEvent,
  RemoveEvent,
  Connection,
  InsertEvent,
} from "typeorm";
import { GrantEntity } from "../entity/grant.entity";
import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/typeorm";
import { SubscribersService } from "../services/subscribers.service";
import { PubnubNotification } from "../pubnub/notification";

@Injectable()
@EventSubscriber()
export class GrantSubscriber implements EntitySubscriberInterface<GrantEntity> {
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly subscribersService: SubscribersService
  ) {
    connection.subscribers.push(this);
  }
  /**
   * Indicates that this subscriber only listen to Grant events.
   */
  listenTo() {
    return GrantEntity;
  }

  /**
   * Called after grant insert.
   */
  async afterInsert(event: InsertEvent<GrantEntity>) {
    let notification = new PubnubNotification();
    const { entity } = event;
    notification
      .setTitle("Receive notification from GrantEntity")
      .setMessage(`Somebody shared his location with you.`)
      .setDomain("devices")
      .setType("Shared")
      .setTargets([entity.owner_id])
      .setFrom(entity.id)
      .setData(entity)
      .setStreamId(entity.stream_id);

    await this.subscribersService.pushGrantToChannelGroup(notification, entity);
  }
}
