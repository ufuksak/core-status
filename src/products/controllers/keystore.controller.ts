import {Body, Controller, Param, Post, Request} from "@nestjs/common";
import {KeystoreService} from "../services/keystore";
import {KeystoreDto} from "../dto/keystore.model";
import {IssueNewKeyPairResponse} from "../response/keystore.response";
import {KeystoreByMeDto} from "../dto/keystore.byme.model";
import {KeyPairCreateResponse} from "../response/keystore.byme.response";
import {Exposed} from "micro-kit-atlas/routing";
import {KeyPairSearchResponse} from "../response/keystore.search.response";
import {PostKeyPairSearchBody} from "../dto/keystore.search.model";


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

    @Post('me/keys')
    async issueNewKeyPairByMe(
        @Request() req,
        @Body() body: KeystoreByMeDto,
        @Param('uuid') uuid: string,
    ): Promise<KeyPairCreateResponse> {
        return this.service.createKeystoreKeyByMe(req.headers.authorization, uuid, body)
    }

    @Exposed.Rest.search({
        description: 'Post request and get a list of key pairs',
        response: KeyPairSearchResponse,
        responseDescription: 'Requested key pair data',
    })
    @Post('keys/search')
    async postSearchKeyPairPublic(
        @Body() body: PostKeyPairSearchBody): Promise<KeyPairSearchResponse> {
        return this.service.postSearchKeyPairPublic(body);
    }
}
