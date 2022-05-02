import {StreamService} from "../services/stream.service";
import {AddStatusInterface, StatusUpdateDto} from "../dto/status.model";
import {TokenData, TokenProtected} from "@globalid/nest-auth";
import {StatusService} from "../services/status.service";
import {ScopedTokenDataParam} from "../commons/scope.decorator";
import {STATUS_MANAGE_SCOPE} from "../util/util";
import {StreamEntity} from "../entity/stream.entity";
import {Body, Controller, Delete, Get, Param, Put, Request} from "@nestjs/common";
import {StreamTypeDto} from "../dto/stream_type.model";
import {StreamTypeEntity} from "../entity/stream_type.entity";
import {StreamTypeService} from "../services/stream_type.service";
import {CreateStreamRequestBody} from "../dto/stream.model";

@Controller('/api/v1/statuses')
export class StatusController {
    constructor(
      private readonly statusService: StatusService,
      private readonly streamService: StreamService,
      private readonly streamTypeService: StreamTypeService
    ) {}

    @Get()
    @TokenProtected()
    async getUserStatuses(@ScopedTokenDataParam(STATUS_MANAGE_SCOPE) tokenData: TokenData) {
        return this.statusService.getUserStatuses(tokenData.uuid);
    }

    @Put()
    @TokenProtected()
    async appendStatus(
      @ScopedTokenDataParam(STATUS_MANAGE_SCOPE) tokenData: TokenData,
      @Body() body: StatusUpdateDto
    ): Promise<AddStatusInterface> {
        const saveStatus = await this.statusService.save(tokenData.uuid, body.status_updates);
        return {
            status_updates: saveStatus,
        };
    }

    @Get('/streams')
    @TokenProtected()
    async getStreams(@ScopedTokenDataParam(STATUS_MANAGE_SCOPE) tokenData: TokenData): Promise<StreamEntity[]> {
        return this.streamService.getAll();
    }

    @Put('/streams')
    @TokenProtected()
    async createStream(
      @Request() req,
      @ScopedTokenDataParam(STATUS_MANAGE_SCOPE) tokenData: TokenData,
      @Body() body: CreateStreamRequestBody): Promise<StreamEntity> {
        const { stream_type, encrypted_private_key, public_key } = body;
        return this.streamService.create(
          tokenData.uuid, req.headers.authorization, stream_type, encrypted_private_key, public_key
        );
    }

    @Get('/streams/types')
    @TokenProtected()
    async getStreamTypes(): Promise<StreamTypeEntity[]>{
        return this.streamTypeService.getAll()
    }

    @Put('/streams/types')
    @TokenProtected()
    async createStreamType(@Body() streamType: StreamTypeDto): Promise<StreamTypeEntity> {
        return this.streamTypeService.save(streamType)
    }

    @Delete('/streams/types/:id')
    @TokenProtected()
    async deleteStreamType(@Param("id") id: string){
      return this.streamTypeService.delete(id)
    }
}
