import {AmqpService, PublisherI} from '@globalid/nest-amqp'
import {Injectable} from '@nestjs/common'
import { GrantWorkerDto } from '../dto/grant-worker.dto';
import {UpdateWorkerDto} from "../dto/update-worker.dto";

@Injectable()
export class StatusPublisher {
    private readonly sender: PublisherI<UpdateWorkerDto>
    private readonly grantSender: PublisherI<GrantWorkerDto>

    constructor(private amqpService: AmqpService) {
        this.sender = this.amqpService.getPublisher(UpdateWorkerDto)
        this.grantSender = this.amqpService.getPublisher(GrantWorkerDto)
    }

    public async publishStatusUpdate(payload: UpdateWorkerDto): Promise<void> {
        await this.sender(payload)
    }

    public async publishGrantUpdate(payload: GrantWorkerDto): Promise<void> {
        await this.grantSender(payload)
    }
}
