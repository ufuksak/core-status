import {Module} from '@nestjs/common';
import {UploadEntity} from "../entity/upload.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UploadRepository} from "../repositories/uploadRepository";
import {UploadService} from "../services/upload.service";
import {UploadsController} from "../controllers/uploads.controller";
import {UploadPublisher} from "../rabbit/uploads.publisher";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UploadEntity,
            UploadRepository
        ])
    ],
    controllers: [UploadsController],
    providers: [UploadService, UploadPublisher],
    exports: [UploadService],
})

export class UploadImageModule {}
