import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Logger,
    Param,
    Post,
    Put,
    Query,
    Req,
    StreamableFile,
    UseFilters,
    UseInterceptors
} from '@nestjs/common';
import {ApiResponse} from '@nestjs/swagger';
import {Request} from 'express';
import {ImageResponseDTO} from '../dto/upload.model';
import {MassDeleteDto, ParamUUID4Dto, UploadQueryDto} from "../dto/s3file.model";
import {UploadService} from "../services/upload.service";
import {UploadExceptionFilter} from "../util/upload-exception-filter";
import {TokenData, TokenDataParam, TokenProtected} from '@globalid/nest-auth';


@Controller('/api/v1/uploads')
@UseFilters(UploadExceptionFilter)
@UseInterceptors(ClassSerializerInterceptor)
export class UploadsController {

    constructor(private readonly uploadImageService: UploadService) {}

    @TokenProtected()
    @Get('/users/file/:file_id')
    @ApiResponse({ status:HttpStatus.OK, type: Buffer })
    async get(
        @Param() {file_id}: ParamUUID4Dto,
        @TokenDataParam() tokenData: TokenData,
    ) {
        const source =  await this.uploadImageService.get(tokenData.uuid, file_id);
        source.on('error', (err) => {
            Logger.error(err.message);
        });
        return new StreamableFile(
            source
        );
    }

    @TokenProtected()
    @Post('/users/file')
    @ApiResponse({ status:HttpStatus.CREATED, type: ImageResponseDTO })
    async upload (
        @Req() req: Request,
        @TokenDataParam() tokenData: TokenData,
        @Query() {type}: UploadQueryDto
    ) {
        return await this.uploadImageService.upload(tokenData.uuid, type, req);
    }

    @TokenProtected()
    @Put('/users/file/:file_id')
    @ApiResponse({ status:HttpStatus.NO_CONTENT, type: ImageResponseDTO })
    async update (
        @Req() req: Request,
        @TokenDataParam() tokenData: TokenData,
        @Param() {file_id}: ParamUUID4Dto,
        @Query() {type}: UploadQueryDto
    ) {
        return await this.uploadImageService.update(tokenData.uuid, file_id, type, req);
    }

    @TokenProtected()
    @Delete('/users/file')
    @ApiResponse({ status:HttpStatus.OK, type: ImageResponseDTO })
    async delete (
        @TokenDataParam() tokenData: TokenData,
        @Body() {ids}: MassDeleteDto
    ) {
        return await this.uploadImageService.deleteMany(tokenData.uuid, ids);
    }
}
