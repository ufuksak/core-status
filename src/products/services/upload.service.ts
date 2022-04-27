import * as busboy from 'busboy';
import {v4 as uuidv4} from 'uuid';
import {InjectRepository} from "@nestjs/typeorm";
import {BadRequestException, Logger, NotFoundException} from "@nestjs/common";
import {Request} from 'express';
import {S3} from "aws-sdk";
import {S3ConfigProvider} from "../config/s3.config.provider";
import {ImageResponseDTO, UploadDto} from "../dto/upload.model";
import {FileRepository} from "../repositories/file.repository";
import {FileEntity, PayloadType} from "../entity/file.entity";
import {MAX_DB_FILE_SIZE, S3_MAX_FILE_SIZE, S3_READ_CHUNK_SIZE, toYyyyMmDd} from "../util/util";
import {InteractiveS3Stream} from "../util/interactive-stream";
import {Readable} from "stream";
import {UploadPublisher} from "../rabbit/uploads.publisher";


export class UploadService {
    private readonly s3Provider: S3ConfigProvider
    private readonly s3ReadChunkSize: number
    private readonly s3MaxFileSize: number

    constructor(
        @InjectRepository(FileRepository) private readonly fileRepo: FileRepository,
        private readonly publisher: UploadPublisher
    ) {
        this.s3Provider = new S3ConfigProvider();
        this.s3ReadChunkSize = S3_READ_CHUNK_SIZE;
        this.s3MaxFileSize = S3_MAX_FILE_SIZE;
    }

    async get(user_id: string, id: string): Promise<Readable> {
        const file = await this.fileRepo.getFileByOptions({
            where: {
                id,
                user_id
            }
        });

        let fileData: Iterable<any> | AsyncIterable<any> = file.data

        if(file.type === PayloadType.lockbox) {
            fileData = await this.getS3(file.bucket, file.key);
        }

        return Readable.from(fileData);
    }

    async update(user_id: string, id: string, payloadType: PayloadType, req: Request) : Promise<FileEntity> {
        let file = null;
        try {
            file = await this.fileRepo.getFileByOptions({
                where: {
                    id,
                    user_id
                }
            });
        } catch (e) {
            throw new NotFoundException('file not found');
        }

        if(payloadType === PayloadType.lockbox) {
            const S3bucket = this.s3Provider.getBucketName();
            const uploaded = await this.uploadS3(req, file.key, S3bucket);
            file.bucket = uploaded.Bucket;
            file.etag = uploaded.ETag;
            file.location = uploaded.Location;
            file.data = null;
        } else {
            file.data = await this.extractFileFromRequest(req);

            if(file.type === PayloadType.lockbox) {
                try {
                    await this.deleteS3(file.key, file.bucket);
                } catch (e) {
                    Logger.error(e);
                }
            }

            file.etag = null;
            file.location = null;
            file.bucket = null;
        }
        file.type = payloadType;
        file.user_id = user_id;

        return this.fileRepo.saveFile(file);
    }

    async upload(user_id: string, payloadType: PayloadType, req: Request) : Promise<FileEntity> {
        const file = new FileEntity();

        file.key = `${toYyyyMmDd(new Date())}/${uuidv4()}`;
        file.type = payloadType;
        file.user_id = user_id;

        if(payloadType === PayloadType.lockbox) {
            const S3bucket = this.s3Provider.getBucketName();
            const uploaded = await this.uploadS3(req, file.key, S3bucket);

            file.bucket = uploaded.Bucket;
            file.etag = uploaded.ETag;
            file.location = uploaded.Location;
        } else {
            try {
                file.data = await this.extractFileFromRequest(req);
            } catch (e) {
                if(e.message === 'file is to long for this type') {
                    throw new BadRequestException('file is to long for this type');
                }
                throw e;
            }

        }

        const result = await this.fileRepo.saveFile(file);
        await this.publisher.publishUploadUpdate(result.toJSON() as UploadDto);
        return result;
    }

    async deleteManyFromS3(files: FileEntity[]) : Promise<FileEntity[]> {
        const result = [];
        await Promise.allSettled(
            files.map(async file => {
                if(file.type === PayloadType.lockbox) {
                    return this.deleteS3(file.key, file.bucket);
                }
            })
        ).then(results => results.forEach(el => {
            if (el.status === 'fulfilled') {
                result.push(el.value);
            } else {
                Logger.error(el.status, el.reason);
            }
        }));
        return result;
    }

    async deleteMany(user_id: string, ids: string[])
        : Promise<{deleted: FileEntity[], notDeleted: {message: any}[]}> {
        const deleted: FileEntity[] = [];
        const notDeleted: {message: any}[] = [];

        await Promise.allSettled(
            ids.map(id => this.delete(user_id, id))
        ).then(results => results.forEach(result => {
            if (result.status === 'fulfilled') {
                deleted.push(result.value);
            } else {
                Logger.error(result.status, result.reason);
                notDeleted.push({
                    message: result?.reason?.message
                });
            }
        }));

        return {
            deleted,
            notDeleted
        };
    }

    async delete(user_id: string, id: string) : Promise<FileEntity> {
        const file = await this.fileRepo.getFileById(id, {
            where: {
                user_id
            }
        });

        if(file.type === PayloadType.lockbox) {
            await this.deleteS3(file.key, file.bucket);
        }

        await this.fileRepo.deleteFile(file.id);
        return file;
    }

    async getS3(bucket, filename: string) {
        const s3 = this.s3Provider.getS3();
        const s3Params = {
            Bucket: bucket,
            Key: String(filename)
        };

        return await this.getFileFromS3(s3, s3Params);
    }

    async uploadS3(req, id, bucket) : Promise<ImageResponseDTO> {
        const s3 = this.s3Provider.getS3();
        const s3Params = {
            Bucket: bucket,
            Key: String(id)
        };

        return this.uploadImageToS3(req, s3, s3Params);
    }

    async deleteS3(name: string, bucket) {
        const s3 = this.s3Provider.getS3();
        const s3Params = {
            Bucket: bucket,
            Key: String(name)
        };

        return this.deleteImageFromS3(s3, s3Params)
    }

    async getFileFromS3(s3 : S3, s3Params): Promise<InteractiveS3Stream> {
        return new Promise((resolve, reject) => {
            try {
                s3.headObject(s3Params, (error, data) => {
                    if (error) {
                        throw error;
                    }
                    const stream = new InteractiveS3Stream(
                        s3Params,
                        s3,
                        data.ContentLength,
                        this.s3ReadChunkSize
                    );

                    resolve(stream);
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    async uploadImageToS3(req, s3 : S3, s3Params) {
        return new Promise((resolve, reject) => {
            const bb = busboy({headers: req.headers});
            try {
                let uploadStartTime = new Date(),
                    busboyFinishTime = null,
                    s3UploadFinishTime = null;

                bb.on('file', function (fieldname, file, filename, encoding, mimetype) {
                    s3Params['Body'] = file;

                    s3.upload(s3Params, (err, data) => {
                        if (err) {
                            Logger.error(err);
                            reject(err);
                        }
                        resolve(data);
                    }).send(function (err, data) {
                        if(err) {
                            Logger.error(err);
                            reject(err);
                        }

                        s3UploadFinishTime = new Date();

                        if(busboyFinishTime && s3UploadFinishTime) {
                            Logger.debug({
                                uploadStartTime: uploadStartTime,
                                busboyFinishTime: busboyFinishTime,
                                s3UploadFinishTime: s3UploadFinishTime
                            });
                        }

                        resolve(data);
                    });
                });

                bb.on('finish', function() {
                    busboyFinishTime = new Date();
                });

                req.pipe(bb);
            } catch (e) {
                Logger.error(e);
                req.unpipe(bb);
                reject(e);
            }
        });
    }

    async deleteImageFromS3(s3 : S3, s3Params) {
        return new Promise((resolve, reject) => {
            s3.deleteObject(s3Params, (err, data) => {
                if (err) {
                    Logger.error(err);
                    reject(err);
                }
                resolve(data);
            });
        });
    }

    async extractFileFromRequest(req: Request): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const bb = busboy({headers: req.headers});
                let fileData: Buffer = null;
                bb.on('file', (fieldName, file) => {
                    file.on('data', (data) => {
                        if (fileData === null) {
                            fileData = data;
                        } else {
                            fileData = Buffer.concat([fileData, data]);
                        }
                        if(fileData.length > MAX_DB_FILE_SIZE) {
                            reject({
                                message: 'file is to long for this type'
                            })
                        }
                    });

                    file.on('error', err => reject(err));
                });
                bb.on('finish', () =>{
                    if (!fileData) {
                        reject({
                            message: 'upload must be valid file'
                        })
                    }
                    resolve(fileData);
                });
                bb.on('error', err => reject(err));
                req.pipe(bb);
            } catch (err) {
                Logger.error(err.message);
                reject(err);
            }
        })
    }
}
