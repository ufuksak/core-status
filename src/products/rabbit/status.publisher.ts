import { AmqpService, PublisherI } from '@globalid/nest-amqp'
import { Injectable } from '@nestjs/common'
import { StatusDto } from "../dto/status.model";

@Injectable()
export class StatusPublisher {
    private readonly sender: PublisherI<StatusDto>

    constructor(private amqpService: AmqpService) {
        this.sender = this.amqpService.getPublisher(StatusDto)
    }

    public async publishStatusUpdate(payload: StatusDto): Promise<void> {
        await this.sender(payload)
    }
}
