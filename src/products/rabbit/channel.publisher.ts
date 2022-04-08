import { AmqpService, PublisherI } from '@globalid/nest-amqp'
import { Injectable } from '@nestjs/common'
import {AddChannelBody} from "../dto/channel.model";


@Injectable()
export class ChannelPublisher {
    private readonly sender: PublisherI<AddChannelBody>

    constructor(private amqpService: AmqpService) {
        this.sender = this.amqpService.getPublisher(AddChannelBody)
    }

    public async publishChannelUpdate(payload: AddChannelBody): Promise<void> {
        await this.sender(payload)
    }
}
