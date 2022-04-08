import { AmqpService, PublisherI } from '@globalid/nest-amqp'
import { Injectable } from '@nestjs/common'
import {ProductDto} from "../dto/product.model";


@Injectable()
export class ProductsPublisher {
    private readonly sender: PublisherI<ProductDto>

    constructor(private amqpService: AmqpService) {
        this.sender = this.amqpService.getPublisher(ProductDto)
    }

    public async publishProductUpdate(payload: ProductDto): Promise<void> {
        await this.sender(payload)
    }
}

