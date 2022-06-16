import {AmqpService, PublisherI} from '@globalid/nest-amqp'
import {Injectable} from '@nestjs/common'
import {GrantWorkerDto} from '../dto/grant-worker.dto';
import {StatusUpdateDto} from "../../../worker/src/dto/status-update.dto";

@Injectable()
export class StatusPublisher {
    private readonly sender: PublisherI<StatusUpdateDto>
    private readonly grantSender: PublisherI<GrantWorkerDto>

    constructor(private amqpService: AmqpService) {
        this.sender = this.amqpService.getPublisher(StatusUpdateDto)
        this.grantSender = this.amqpService.getPublisher(GrantWorkerDto)
    }

    public async publishStatusUpdate(payload: StatusUpdateDto): Promise<void> {
        await this.sender(payload, {
            routingKey: `status.user.${payload.stream_id}.${payload.id}`
        });
    }
}
