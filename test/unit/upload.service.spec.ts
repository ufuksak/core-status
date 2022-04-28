import {Test, TestingModule} from '@nestjs/testing';
import {getRepositoryToken} from "@nestjs/typeorm";
import {v4 as uuid} from 'uuid';
import {UploadRepository} from "../../src/products/repositories/uploadRepository";
import {NotFoundException} from "@nestjs/common";
import {Readable} from "stream";
import {UploadEntity} from "../../src/products/entity/upload.entity";
import {FindOneOptions} from "typeorm";
import {UploadService} from "../../src/products/services/upload.service";
import {UploadPublisher} from "../../src/products/rabbit/uploads.publisher";


const mockUserId = "748964969432547329";
const userMock = {
    "id": "748964969432547329",
    "username": "mockuser",
    "pin": "pin",
    "name": "mock",
    "surname": "user",
    "address_line_1": "test address1",
    "address_line_2": "address2",
    "city": "Rome",
    "state_province": "-",
    "postal_code": "32000",
    "country": "Finland",
    "phone_num": "009055570354575",
    "mobile_num": "0090555703517865",
    "fax_num": "-",
    "gpsList": [
        {
            "device_id": "1",
            "speed": 50,
            "direction": 50
        }
    ],
    "actionList": [
        {
            "name": "userSave",
            "description": "user save"
        }
    ]
};


const smallPayloadMock = 'smallpayload';
const smallFileMockId = "748989885432070145";
const smallFileMock = {
    "key": "3f90a691-0059-4ee8-b52a-4528f49818e3",
    "type": "content",
    "user_id": "748964969432547329",
    "location": null,
    "bucket": null,
    "etag": null,
    "id": "748989885432070145",
    "created_at": "2022-03-30T09:39:33.422Z",
    "updated_at": "2022-03-30T09:39:33.422Z",
    "data": Buffer.from(smallPayloadMock)
};

describe('UploadSerivce', () => {
    let service: UploadService;
    let getFileByOptions: jest.Mock;
    let getUserById: jest.Mock;
    let deleteFile: jest.Mock;
    let getFileById: jest.Mock;

    beforeEach(async () => {
        getUserById = jest.fn();
        getFileByOptions = jest.fn();
        deleteFile = jest.fn();
        getFileById = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UploadService,
                {
                    provide: UploadPublisher,
                    useValue: {
                        publishUploadUpdate: jest.fn((update) => {})
                    }
                },
                {
                    provide: getRepositoryToken(UploadRepository),
                    useValue: {
                        getFileByOptions,
                        getFileById,
                        deleteFile
                    }
                }
            ],
        }).compile();
        service = await module.get<UploadService>(UploadService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('get file', () => {
        describe('should not get for non existing user',() => {
            const fileNotFoundMsg = 'file not found';
            beforeEach(() => {
                getUserById.mockImplementation(() => {
                    throw new NotFoundException(fileNotFoundMsg);
                });
                getFileByOptions.mockImplementation(() => {
                    throw new NotFoundException(fileNotFoundMsg)
                });
            });

            it('should not get for non-existing user', async () => {
                const userId = uuid();
                const randomFile = uuid();

                try {
                    await service.get(userId, randomFile);
                } catch (e) {
                    expect(e instanceof NotFoundException)
                        .toEqual(true);
                    expect(e.message)
                        .toEqual(fileNotFoundMsg);
                }
            });
        });

        describe('should not get for non existing file',() => {
            const fileNotFoundMsg = 'file not found';
            beforeEach(() => {
                getUserById.mockImplementation(() => {
                    throw new NotFoundException(fileNotFoundMsg);
                });
                getFileByOptions.mockImplementation(() => {
                    throw new NotFoundException(fileNotFoundMsg)
                });
            });

            it('should not get for non-existing file', async () => {
                const userId = uuid();
                const randomFile = uuid();

                try {
                    await service.get(userId, randomFile);
                } catch (e) {
                    expect(e instanceof NotFoundException)
                        .toEqual(true);
                    expect(e.message)
                        .toEqual(fileNotFoundMsg);
                }
            });
        });

        describe('should get db file',() => {
            let file: UploadEntity;
            beforeEach(() => {
                file = new UploadEntity();
                Object.assign(file, smallFileMock)
                getFileByOptions.mockReturnValue(Promise.resolve(smallFileMock));
            });

            it('should be found', async () => {
                const userId = uuid();
                const randomFile = uuid();

                const readStream = await service.get(userId, randomFile);
                expect(readStream instanceof Readable)
                    .toEqual(true);

                const chunks = [];

                const reversed = await new Promise((resolve, reject) => {
                    readStream.on('data', d => chunks.push(d));
                    readStream.on('error', err => reject(err));
                    readStream.on('end', () => {
                        resolve(Buffer.concat(chunks).toString());
                    });
                })

                expect(reversed).toEqual(smallPayloadMock);
            });
        });
    })

    describe('delete file', () => {
        describe('should delete only existing file',() => {
            beforeEach(() => {
                let storage = {};
                storage[smallFileMockId] = Object.assign({}, smallFileMock);
                deleteFile.mockImplementation(async (id) => {
                    const maybeFound = storage[id];
                    if(maybeFound) {
                        const result = {
                            value: maybeFound,
                            status: 'fulfilled'
                        }
                        delete storage[id];
                        return result
                    } else {
                        return {
                            value: {},
                            status: 'rejected'
                        }
                    }
                });
                getFileById.mockImplementation(
                    async (id: string, options?: FindOneOptions<UploadEntity>) => {
                        const maybeRet = storage[id];
                        if(!maybeRet) {
                            throw new NotFoundException('file not found');
                        }
                        return maybeRet;
                    }
                );
            });

            it('non-existing not deleted', async () => {
                const randomFile = uuid();

                const result = await service.deleteMany(mockUserId, [randomFile]);
                expect(result.deleted.length)
                    .toEqual(0);
                expect(result.notDeleted.length)
                    .toEqual(1);
            });

            it('existing deleted', async () => {
                const randomFile = uuid();
                const result = await service.deleteMany(mockUserId, [smallFileMockId, randomFile]);
                expect(result.deleted.length)
                    .toEqual(1);
                expect(result.notDeleted.length)
                    .toEqual(1);
            });
        });
    });
});
