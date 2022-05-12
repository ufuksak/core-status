import {AmqpService, PublisherI} from '@globalid/nest-amqp'
import {Injectable} from '@nestjs/common'
import {UpdateWorkerDto} from "../dto/update-worker.dto";

@Injectable()
export class StatusPublisher {
    private readonly sender: PublisherI<UpdateWorkerDto>

    constructor(private amqpService: AmqpService) {
        this.sender = this.amqpService.getPublisher(UpdateWorkerDto)
    }

    public async publishStatusUpdate(payload: UpdateWorkerDto): Promise<void> {
        await this.sender(payload)
    }
}
