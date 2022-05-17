import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm';
import {StatusController} from "../controllers/status.controller";
import {GrantRepository} from '../repositories/grant.repository';
import {StreamRepository} from '../repositories/stream.repository';
import {StreamTypeRepository} from '../repositories/stream_type.repository';
import {GrantService} from '../services/grant.service';
import {StreamService} from "../services/stream.service";
import {KeystoreModule} from './keystore.module';
import {StatusRepository} from "../repositories/status.repository";
import {StatusPublisher} from "../rabbit/status.publisher";
import {StatusService} from "../services/status.service";
import {UploadRepository} from "../repositories/uploadRepository";
import {UploadService} from "../services/upload.service";
import {UploadPublisher} from "../rabbit/uploads.publisher";
import {StreamTypeService} from '../services/stream_type.service';
import {StreamTypeNotExistsRule} from "../validators/stream-type.validator";
import {UpdateSubscriber} from "../subscribers/update.subscriber";
import {SubscribersService} from "../services/subscribers.service";

@Module({
    imports: [
      KeystoreModule,
      TypeOrmModule.forFeature([
        StreamRepository,
        StreamTypeRepository,
        GrantRepository,
        StatusRepository,
        UploadRepository
      ])
    ],
    controllers: [StatusController],
    providers: [
      StreamService,
      StreamTypeService,
      GrantService,
      StatusPublisher,
      StatusService,
      UploadService,
      UploadPublisher,
      StreamTypeNotExistsRule,
      UpdateSubscriber,
      SubscribersService
    ]
})
export class StatusModule {}
