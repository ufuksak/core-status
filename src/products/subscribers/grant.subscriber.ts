import {Connection, EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent,} from "typeorm";
import {GrantEntity} from "../entity/grant.entity";
import {Injectable} from "@nestjs/common";
import {InjectConnection} from "@nestjs/typeorm";
import {SubscribersService} from "../services/subscribers.service";
import {PubnubNotification} from "../pubnub/notification";
import {CacheService} from "../services/cache.service";

@Injectable()
@EventSubscriber()
export class GrantSubscriber implements EntitySubscriberInterface<GrantEntity> {
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly subscribersService: SubscribersService,
    private readonly cacheService: CacheService,
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
    const { entity } = event;
    const { id, stream_id, properties } = entity;
    const keyKey = this.cacheService.builtReEncryptionPerGrantKey(id);
    const grantKey = this.cacheService.builtGrantsPerStreamKey(stream_id);

    await this.cacheService.sadd(grantKey, [JSON.stringify(entity)]);
    await this.cacheService.set(keyKey, properties.reEncryptionKey);

    let notification = new PubnubNotification();
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
