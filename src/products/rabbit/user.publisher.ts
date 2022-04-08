import { AmqpService, PublisherI } from '@globalid/nest-amqp'
import { Injectable } from '@nestjs/common'
import {UserDto} from "../dto/user.model";


@Injectable()
export class UserPublisher {
    private readonly sender: PublisherI<UserDto>

    constructor(private amqpService: AmqpService) {
        this.sender = this.amqpService.getPublisher(UserDto)
    }

    public async publishUserUpdate(payload: UserDto): Promise<void> {
        await this.sender(payload)
    }
}

