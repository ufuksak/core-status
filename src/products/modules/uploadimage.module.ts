import {Module} from '@nestjs/common';
import {FileEntity} from "../entity/file.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {FileRepository} from "../repositories/file.repository";
import {UploadService} from "../services/upload.service";
import {UploadsController} from "../controllers/uploads.controller";
import {UploadPublisher} from "../rabbit/uploads.publisher";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            FileEntity,
            FileRepository
        ])
    ],
    controllers: [UploadsController],
    providers: [UploadService, UploadPublisher],
    exports: [UploadService],
})

export class UploadImageModule {}
