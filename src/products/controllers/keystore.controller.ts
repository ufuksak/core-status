import {Body, Controller, Get, Request, Param, Post} from "@nestjs/common";
import {KeystoreService} from "../services/keystore";
import {KeystoreDto} from "../dto/keystore.model";
import {IssueNewKeyPairResponse} from "../response/keystore.response";


@Controller('/api/v1/identity/')
export class KeystoreController {

    constructor(private service: KeystoreService) {
    }

    @Post(':uuid/keys')
    async issueNewKeyPair(
        @Request() req,
        @Body() body: KeystoreDto,
        @Param('uuid') uuid: string,
    ): Promise<IssueNewKeyPairResponse> {
        return this.service.createKeystore(req.headers.authorization, uuid, body)
    }

    @Get()
    async getKeystore(page: number = 1, perPage: number = 20) {
        await this.service.getKeystore(page, perPage);
    }
}
