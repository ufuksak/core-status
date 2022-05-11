import {StreamService} from "../services/stream.service";
import {AddStatusInterface, GetUserStatusesParams, StatusUpdateDto} from "../dto/status.model";
import {TokenData, TokenProtected} from "@globalid/nest-auth";
import {StatusService} from "../services/status.service";
import {ScopedTokenDataParam} from "../commons/scope.decorator";
import {GRANTS_CREATE_SCOPE, GRANTS_DELETE_SCOPE, GRANTS_MANAGE_SCOPE, STATUS_MANAGE_SCOPE} from "../util/util";
import {StreamEntity} from "../entity/stream.entity";
import {Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query, Request} from "@nestjs/common";
import {StreamTypeDto} from "../dto/stream_type.model";
import {StreamTypeEntity} from "../entity/stream_type.entity";
import {StreamTypeService} from "../services/stream_type.service";
import {CreateStreamRequestBody} from "../dto/stream.model";
import {
    DeletedUpdate,
    DeleteStatusDateRangeDto,
    MassUpdateDeleteDto,
    SingleUpdateDeleteDto,
    UUUIDParam
} from "../dto/s3file.model";
import {GrantService} from "../services/grant.service";
import {GrantDto} from "../dto/grant.model";
import {GrantEntity} from "../entity/grant.entity";

@Controller('/api/v1/status')
export class StatusController {
    constructor(
      private readonly statusService: StatusService,
      private readonly streamService: StreamService,
      private readonly grantService: GrantService,
      private readonly streamTypeService: StreamTypeService
    ) {}

    @Get()
    @TokenProtected()
    async getUserStatuses(
      @ScopedTokenDataParam(STATUS_MANAGE_SCOPE) tokenData: TokenData,
      @Query() params: GetUserStatusesParams
    ) {
        return this.statusService.getUserStatuses(tokenData.uuid, params);
    }

    @Post('/')
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
    
    @Delete()
    @TokenProtected()
    async removeStatus(
      @ScopedTokenDataParam(STATUS_MANAGE_SCOPE) tokenData: TokenData,
      @Body() body: MassUpdateDeleteDto
    ) : Promise<DeletedUpdate[]> {
        return this.statusService.removeStatusUpdates(tokenData.uuid, body);
    }

    @Delete('/:id')
    @TokenProtected()
    async removeStatusUpdate(
      @ScopedTokenDataParam(STATUS_MANAGE_SCOPE) tokenData: TokenData,
      @Body() body: SingleUpdateDeleteDto,
      @Param() param: UUUIDParam
    ) : Promise<DeletedUpdate> {
        return this.statusService.removeStatusUpdate(
          tokenData.uuid, {id: param.id, stream_id: body.stream_id}
        );
    }

    @Delete('/update/range')
    @TokenProtected()
    async removeStatusByDateRange(
      @ScopedTokenDataParam(STATUS_MANAGE_SCOPE) tokenData: TokenData,
      @Body() body: DeleteStatusDateRangeDto
    ) : Promise<DeletedUpdate[]> {
        return this.statusService.removeStatusUpdatesByDateRange(tokenData.uuid, body);
    }

    @Get('/streams')
    @TokenProtected()
    async getStreams(@ScopedTokenDataParam(STATUS_MANAGE_SCOPE) tokenData: TokenData): Promise<StreamEntity[]> {
        return this.streamService.getAll();
    }

    @TokenProtected()
    @Post('/grants')
    createGrant(@ScopedTokenDataParam(GRANTS_CREATE_SCOPE) tokenData: TokenData, @Body() grant: GrantDto) {
        return this.grantService.save(tokenData, grant);
    }

    @TokenProtected()
    @Get('/grants/:id')
    getGrant(@ScopedTokenDataParam(GRANTS_MANAGE_SCOPE) tokenData: TokenData,
             @Param() {id}: UUUIDParam)  : Promise<GrantEntity> {
        return this.grantService.get(id, tokenData.uuid);
    }

    @TokenProtected()
    @Delete('/grants/:id')
    deleteGrant(@ScopedTokenDataParam(GRANTS_DELETE_SCOPE) tokenData: TokenData,
                @Param() {id}: UUUIDParam)  : Promise<GrantEntity> {
        return this.grantService.delete(id, tokenData.uuid);
    }

    @Post('/streams')
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

    @Post('/streams/types')
    @TokenProtected()
    async createStreamType(
      @ScopedTokenDataParam(STATUS_MANAGE_SCOPE) tokenData: TokenData,
      @Body() streamType: StreamTypeDto): Promise<StreamTypeEntity> {
        return this.streamTypeService.save(streamType)
    }

    @Delete('/streams/types/:id')
    @TokenProtected()
    async deleteStreamType(@Param() {id}: UUUIDParam){
      return this.streamTypeService.delete(id)
    }
}
