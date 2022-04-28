import {Body, Controller, Put, Request} from "@nestjs/common";
import { CreateStreamRequestBody } from "../dto/stream.dto";
import { StreamService } from "../services/stream.service";

@Controller('/api/v1/status')
export class StatusController {

    constructor(private streamService: StreamService) {}

    @Put('/streams')
    async createStream(@Request() req, @Body() body: CreateStreamRequestBody): Promise<string> {
        const { streamType, encryptedPrivateKey, publicKey } = body;

        return this.streamService.save(req.headers.authorization, streamType, encryptedPrivateKey, publicKey)
    }
}
