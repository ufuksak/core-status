import {AmqpService, PublisherI} from '@globalid/nest-amqp'
import {Injectable} from '@nestjs/common'
import {KeystoreDto} from "../dto/keystore.model";


@Injectable()
export class KeystorePublisher {
    private readonly sender: PublisherI<KeystoreDto>

    constructor(private amqpService: AmqpService) {
        this.sender = this.amqpService.getPublisher(KeystoreDto)
    }

    public async publishKeystoreUpdate(payload: KeystoreDto): Promise<void> {
        await this.sender(payload)
    }
}
