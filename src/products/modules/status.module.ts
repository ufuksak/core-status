import {Module} from '@nestjs/common'
import {TypeOrmModule} from '@nestjs/typeorm';
import {StatusController} from "../controllers/status.controller";
import {StreamRepository} from '../repositories/stream.repository';
import {StreamService} from "../services/stream.service";
import {KeystoreModule} from './keystore.module';
import {StatusRepository} from "../repositories/status.repository";
import {StatusPublisher} from "../rabbit/status.publisher";
import {StatusService} from "../services/status.service";
import {UploadRepository} from "../repositories/uploadRepository";
import {UploadService} from "../services/upload.service";
import {UploadPublisher} from "../rabbit/uploads.publisher";
import {StreamTypeRepository} from '../repositories/stream_type.repository';
import {StreamTypeService} from '../services/stream_type.service';
import {StreamTypeNotExistsRule} from "../validators/stream-type.validator";

@Module({
    imports: [
      KeystoreModule,
      TypeOrmModule.forFeature([
        StreamRepository,
        StatusRepository,
        UploadRepository,
        StreamTypeRepository
      ])
    ],
    controllers: [StatusController],
    providers: [
      StreamService,
      StreamTypeService,
      StatusPublisher,
      StatusService,
      UploadService,
      UploadPublisher,
      StreamTypeNotExistsRule
    ]
})
export class StatusModule {}
