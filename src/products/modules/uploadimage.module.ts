import { Module } from '@nestjs/common';
import { UploadImageController } from '../controllers/uploadimage.controller';
import { UploadImageService } from '../services/uploadimage.service';

@Module({
    controllers: [UploadImageController],
    providers: [UploadImageService],
    exports: [UploadImageService],
})

export class UploadImageModule {}
