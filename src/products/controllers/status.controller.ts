import {Body, Controller, Put, Get, Request, Post, Delete, Param} from "@nestjs/common";
import { CreateStreamRequestBody } from "../dto/stream.model";
import { StreamTypeDto } from "../dto/stream_type.model";
import { StreamTypeEntity } from "../entity/stream_type.entity";
import { StreamService } from "../services/stream.service";
import { StreamTypeService } from "../services/stream_type.service";
import { TokenData, TokenDataParam, TokenProtected } from '@globalid/nest-auth'
import { GrantDto } from "../dto/grant.model";
import { GrantService } from "../services/grant.service";

@Controller('/api/v1/status')
export class StatusController {

    constructor(
      private streamService: StreamService,
      private grantService: GrantService,
      private streamTypeService: StreamTypeService
    ) {}

    @TokenProtected()
    @Put('/streams')
    async createStream(@Request() req, @TokenDataParam() tokenData: TokenData, @Body() body: CreateStreamRequestBody): Promise<string> {
      const { streamType, encryptedPrivateKey, publicKey } = body;
      const { client_id: clientId} = tokenData;

      return this.streamService.save(req.headers.authorization, clientId, streamType, encryptedPrivateKey, publicKey);
    }

    @TokenProtected()
    @Put('/grants')
    createGrant(@TokenDataParam() tokenData: TokenData, @Body() grant: GrantDto): Promise<string> {
      return this.grantService.save(tokenData, grant);
    }

    @Get('/streams/types')
    getStreamTypes(): Promise<StreamTypeEntity[]>{
      return this.streamTypeService.getAll()
    }

    @Post('/streams/types')
    createStreamType(@Body() streamType: StreamTypeDto): Promise<StreamTypeEntity> {
      return this.streamTypeService.save(streamType)
    }

    @Delete('/streams/types/:id')
    deleteStreamType(@Param("id") id: string){
      return this.streamTypeService.delete(id)
    }
}
