import {Module} from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import {StatusController} from "../controllers/status.controller";
import { StreamRepository } from '../repositories/stream.repository';
import {StreamService} from "../services/stream.service";
import { KeystoreModule } from './keystore.module';

@Module({
    imports: [
      KeystoreModule,
      TypeOrmModule.forFeature([
        StreamRepository
      ])
    ],
    controllers: [StatusController],
    providers: [StreamService],
})
export class StatusModule {}
