import {Module} from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import {StatusController} from "../controllers/status.controller";
import { GrantRepository } from '../repositories/grant.repository';
import { StreamRepository } from '../repositories/stream.repository';
import { StreamTypeRepository } from '../repositories/stream_type.repository';
import { GrantService } from '../services/grant.service';
import {StreamService} from "../services/stream.service";
import { StreamTypeService } from '../services/stream_type.service';
import { KeystoreModule } from './keystore.module';

@Module({
    imports: [
      KeystoreModule,
      TypeOrmModule.forFeature([
        StreamRepository,
        StreamTypeRepository,
        GrantRepository
      ])
    ],
    controllers: [StatusController],
    providers: [
      StreamService,
      StreamTypeService,
      GrantService
    ],
})
export class StatusModule {}
