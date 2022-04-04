import {EntityRepository, FindOneOptions, Repository} from "typeorm";
import {FileEntity} from "../entity/file.entity";
import {NotFoundException} from "@nestjs/common";

@EntityRepository(FileEntity)
export class FileRepository extends Repository<FileEntity> {

    saveFile = async (file: FileEntity) : Promise<FileEntity> => {
        await this.save(file);
        return file;
    }

    getFiles = async () : Promise<FileEntity[]> => {
        return this.find();
    }

    getFileById = async (id: string, options?: FindOneOptions<FileEntity>) : Promise<FileEntity> => {
        const file = await this.findOne(id);
        if(!file) {
            throw new NotFoundException('file not found')
        }
        return await this.findOne(id);
    }

    getFileByOptions = async (options?: FindOneOptions<FileEntity>) : Promise<FileEntity> =>  {
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
