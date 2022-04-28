import {Body, Controller, Put, Get, Request, Post, Delete, Param} from "@nestjs/common";
import { CreateStreamRequestBody } from "../dto/stream.model";
import { StreamTypeDto } from "../dto/stream_type.model";
import { StreamTypeEntity } from "../entity/stream_type.entity";
import { StreamService } from "../services/stream.service";
import { StreamTypeService } from "../services/stream_type.service";

@Controller('/api/v1/status')
export class StatusController {

    constructor(private streamService: StreamService, private streamTypeService: StreamTypeService) {}

    @Put('/streams')
    createStream(@Request() req, @Body() body: CreateStreamRequestBody): Promise<string> {
      const { streamType, encryptedPrivateKey, publicKey } = body;

      return this.streamService.save(req.headers.authorization, streamType, encryptedPrivateKey, publicKey)
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
