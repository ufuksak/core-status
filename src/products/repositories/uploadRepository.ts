import {EntityRepository, FindOneOptions, Repository} from "typeorm";
import {UploadEntity} from "../entity/upload.entity";
import {NotFoundException} from "@nestjs/common";

@EntityRepository(UploadEntity)
export class UploadRepository extends Repository<UploadEntity> {

    saveFile = async (file: UploadEntity) : Promise<UploadEntity> => {
        await this.save(file);
        delete file['data'];
        return file;
    }

    getFiles = async () : Promise<UploadEntity[]> => {
        return this.find();
    }

    getFileById = async (id: string, options?: FindOneOptions<UploadEntity>) : Promise<UploadEntity> => {
        const file = await this.findOne(id);
        if(!file) {
            throw new NotFoundException('file not found')
        }
        return await this.findOne(id);
    }

    getFileByOptions = async (options?: FindOneOptions<UploadEntity>) : Promise<UploadEntity> =>  {
        const file = await this.findOne(options);
        if(!file) {
            throw new NotFoundException('file not found');
        }
        return file;
    }

    deleteFile = async (id: string) => {
        try {
            return this.delete(id);
        } catch (e) {
            throw new NotFoundException('not found');
        }
    }
}
