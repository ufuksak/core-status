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
    Res,
    StreamableFile,
    UseFilters,
    UseInterceptors
} from '@nestjs/common';
import {ApiResponse} from '@nestjs/swagger';
import {Request, Response} from 'express';
import {ImageResponseDTO} from '../dto/upload.model';
import {MassDeleteDto, ParamUserId, ParamUUID4Dto, UploadQueryDto} from "../dto/s3file.model";
import {UploadService} from "../services/upload.service";
import {UploadExceptionFilter} from "../util/upload-exception-filter";


@Controller('/api/v1/upload')
@UseFilters(UploadExceptionFilter)
@UseInterceptors(ClassSerializerInterceptor)
export class UploadImageController {

    constructor(
        private readonly uploadImageService: UploadService
    ) {}

    @Get('/users/:user_id/file/:file_id')
    @ApiResponse({ status:HttpStatus.OK, type: Buffer })
    async get(
        @Param() {file_id, user_id}: ParamUUID4Dto
    ) {
        const source =  await this.uploadImageService.get(user_id, file_id);
        source.on('error', (err) => {
            Logger.error(err.message);
        });
        return new StreamableFile(
            source
        );
    }

    @Post('/users/:user_id/file')
    @ApiResponse({ status:HttpStatus.CREATED, type: ImageResponseDTO })
    async upload (
        @Req() req: Request,
        @Param() {user_id}: ParamUserId,
        @Query() {type}: UploadQueryDto
    ) {
        return await this.uploadImageService.upload(user_id, type, req);
    }

    @Put('/users/:user_id/file/:file_id')
    @ApiResponse({ status:HttpStatus.NO_CONTENT, type: ImageResponseDTO })
    async update (
        @Req() req: Request,
        @Param() {file_id, user_id}: ParamUUID4Dto,
        @Query() {type}: UploadQueryDto
    ) {
        return await this.uploadImageService.update(user_id, file_id, type, req);
    }

    @Delete('/users/:user_id/file')
    @ApiResponse({ status:HttpStatus.OK, type: ImageResponseDTO })
    async delete (
        @Param() {user_id}: ParamUserId,
        @Body() {ids}: MassDeleteDto
    ) {
        return await this.uploadImageService.deleteMany(user_id, ids);
    }
}
