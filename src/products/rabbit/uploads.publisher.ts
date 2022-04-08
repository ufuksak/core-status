import { AmqpService, PublisherI } from '@globalid/nest-amqp'
import { Injectable } from '@nestjs/common'
import {UploadDto} from "../dto/upload.model";


@Injectable()
export class UploadPublisher {
    private readonly sender: PublisherI<UploadDto>

    constructor(private amqpService: AmqpService) {
        this.sender = this.amqpService.getPublisher(UploadDto)
    }

    public async publishUploadUpdate(payload: UploadDto): Promise<void> {
        await this.sender(payload)
    }
}

