import {Module} from '@nestjs/common';
import {UploadImageController} from '../controllers/uploadimage.controller';
import {FileEntity} from "../entity/file.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {FileRepository} from "../repositories/file.repository";
import {UserRepository} from "../repositories/user.repository";
import {UploadService} from "../services/upload.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            FileEntity,
            FileRepository,
            UserRepository
        ])
    ],
    controllers: [UploadImageController],
    providers: [UploadService],
    exports: [UploadService],
})

export class UploadImageModule {}
