import {EventSubscriber, EntitySubscriberInterface, UpdateEvent, RemoveEvent, Connection, InsertEvent} from 'typeorm';
import {GrantEntity} from '../entity/grant.entity';
import {Injectable} from "@nestjs/common";
import {InjectConnection} from "@nestjs/typeorm";
import {SubscribersService} from "../services/subscribers.service";

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
        const {entity} = event;
        await this.subscribersService.pushGrantToChannelGroup(entity);
    }
}
