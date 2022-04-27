import {Body, Controller, Get, Put, Request} from "@nestjs/common";
import {CreateStreamRequestBody} from "../dto/stream.dto";
import {StreamService} from "../services/stream.service";
import {StatusRequestBody, StatusResponseBody} from "../dto/status.model";
import {TokenData, TokenDataParam, TokenProtected} from "@globalid/nest-auth";
import {StatusService} from "../services/status.service";

@Controller('/api/v1/statuses')
export class StatusController {

    constructor(private streamService: StreamService,
                private statusService: StatusService,) {}

    // @Get()
    // @TokenProtected()
    // async getUserStatuses(@TokenDataParam() tokenData: TokenData) {
    //     return this.userService.getUserStatuses(tokenData.uuid);
    // }

    @Put()
    @TokenProtected()
    async updateStatus(
      @TokenDataParam() tokenData: TokenData,
      @Body() body: StatusRequestBody
    ): Promise<StatusResponseBody> {
        const { status_updates } = body;

        const saveStatus = await this.statusService.save(tokenData.uuid, status_updates);

        return {
            status_updates: saveStatus,
        };
    }

    @Put('/streams')
    async createStream(@Request() req, @Body() body: CreateStreamRequestBody): Promise<string> {
        const { streamType, encryptedPrivateKey, publicKey } = body;

        return this.streamService.save(req.headers.authorization, streamType, encryptedPrivateKey, publicKey)
    }
}
