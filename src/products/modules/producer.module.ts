import { Module } from '@nestjs/common'
import { ProducerController } from '../controllers/producer.controller'

@Module({
  imports: [],
  controllers: [ProducerController],
  providers: [],
})
export class ProducerModule {}
