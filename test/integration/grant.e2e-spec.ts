import {INestApplication, ValidationPipe} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {AppUpdateTestModule} from "./modules/app.update.test.module";
import {JsonApiExceptionTransformer} from "../../src/products/commons/transformer/jsonapi-exception.transformer";
import {JsonApiTransformer} from "../../src/products/commons/transformer/jsonapi.transformer";
import {useContainer} from "class-validator";
import {getAccessToken} from "../getacctoken";
import {truncateEntity} from "./helpers";
import {StreamEntity} from "../../src/products/entity/stream.entity";
import {StreamTypeEntity} from "../../src/products/entity/stream_type.entity";
import {UpdateEntity} from "../../src/products/entity/update.entity";
import {validationPipeOptions} from "../../src/products/config/validation-pipe.options";
import {Scopes} from "../../src/products/util/util";
import {GrantEntity} from "../../src/products/entity/grant.entity";
import {GrantDto, GrantType} from "../../src/products/dto/grant.model";
import {CHANNEL_PREFIX} from "../../worker/src/services/pubnub.service";
import {addListener as transportInit} from "../../src/products/pubnub/pubnub";
import {Transport} from "../../src/products/pubnub/interfaces";
import * as cryptosdk from 'globalid-crypto-library';
import {v4 as uuid} from 'uuid';
import {AlgorithmType, Purpose} from "../../src/products/dto/keystore.byme.model";
import supertest = require("supertest");
import { encryptPayload } from "../../src/products/util/pre";

jest.setTimeout(3 * 60 * 1000);

type GrantPrepareOptions = {
    streamId: string,
    type: GrantType,
    customToken?: string,
    httpCode?: number,
    recipient_id?: string
}

const allScopes = Object.values(Scopes).join(' ');

const authType = {type: "bearer"};
const uuidLength = 36;
const streamType = 'streamentitys';
const originalPayload = 'some payload';

const allGrants = Object.values(GrantType);

describe('Grant Ranges (e2e)', () => {
    let app: INestApplication;
    let server = null;
    let agent = null;
    const recipient_id = "95abffad-9c5b-40da-ada5-a156418b64ef";
    const statusDate = "2022-04-28T23:05:46.944Z";

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppUpdateTestModule]
        }).compile();

        const transportConf: Transport.Config = {
            subscribeKey: 'sub-c-b791aa8d-6d5d-4f39-8de1-d81bc4dfe39e',
            publishKey: 'pub-c-2c1361ef-be16-4581-89aa-6be9df0c9910',
            logVerbosity: false,
            uuid: recipient_id,
        }

        app = moduleFixture.createNestApplication();
        useContainer(app.select(AppUpdateTestModule), {fallbackOnErrors: true});
        app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
        app.useGlobalFilters(new JsonApiExceptionTransformer());
        app.useGlobalInterceptors(new JsonApiTransformer());
        server = await app.getHttpServer();
        agent = await supertest.agent(server);
        transportInit(transportConf);
        await app.init();
    });

    beforeEach(async () => {
        await Promise.all([UpdateEntity, StreamEntity, StreamTypeEntity, GrantEntity]
            .map(el => truncateEntity(el))
        );
    });

    const prepareAndTestStatusOperations =
        async (token: string, public_key: string, encrypted_private_key: string) => {
        await createStreamTypeAndExpect(token);
        await createStreamAndExpect(token, public_key, encrypted_private_key);
        const resp = await agent
            .get('/api/v1/status/streams')
            .set('Accept', 'application/json')
            .auth(token, authType)
            .send()
            .expect('Content-Type', /json/)
            .expect(200);

        return {streamId: resp?.body?.data?.[0].id, streamType: resp?.body?.data?.[0].type};
    }

    const createStreamTypeAndExpect = async (token: string) => {
        const streamTypeOutput = {
            granularity: 'single',
            stream_handling: 'e2e',
            approximated: true,
            supported_grants: allGrants,
            type: streamType,
            updated_at: expect.any(String),
            created_at: expect.any(String)
        };

        const streamTypeData = {
            granularity: 'single',
            stream_handling: 'e2e',
            approximated: true,
            supported_grants: allGrants,
            type: streamType
        };

        // Run your end-to-end test
        const resp = await agent
            .post('/api/v1/status/streams/types')
            .auth(token, authType)
            .send(streamTypeData)
            .expect(201);

        expect(resp?.body?.data?.attributes).toEqual(streamTypeOutput);
    }

    const createStreamAndExpect = async (token: string, public_key: string, encrypted_private_key: string) => {
        // prepare
        const streamData = {
            "stream_type": streamType,
            "public_key": public_key,
            "encrypted_private_key": encrypted_private_key,
        };

        // Act
        const resp = await agent
            .post('/api/v1/status/streams')
            .set('Accept', 'text/plain')
            .auth(token, authType)
            .send(streamData)
            .expect('Content-Type', "application/json; charset=utf-8")
            .expect(201);

        // Check
        expect(resp?.body?.data?.id).toHaveLength(uuidLength);
    };

    const prepareGrantAndExpect = async (
        token: string,
        fromDate: string,
        toDate: string,
        inputReEncryptionKey: any,
        userBid: string,
        options: GrantPrepareOptions) => {
        const {streamId, type} = options;
        const grantData = {
            stream_id: streamId,
            recipient_id: userBid,
            properties: {
                e2eKey: 'pre',
                reEncryptionKey: inputReEncryptionKey
            },
            fromDate: fromDate,
            toDate: toDate,
            type: type
        } as GrantDto;

        // Run your end-to-end test
        const resp = await agent
            .post('/api/v1/status/grants')
            .set('Accept', 'text/plain')
            .auth(options.customToken || token, authType)
            .send(grantData)
            .expect('Content-Type', "application/json; charset=utf-8")
            .expect(options.httpCode || 201);

        return {id: resp?.body?.data?.id};
    };

    const prepareGrantEntities = async (
                                        count: number,
                                        grantType: GrantType,
                                        fromDate: string,
                                        toDate: string
                                        ) => {
        const {userBid, userAToken, userBToken, userAKeysFromInternalStorage} = await prepareUserKeys();
        const {streamId} = await prepareAndTestStatusOperations(userAToken,
            userAKeysFromInternalStorage.public_key, cryptosdk.PRE.encrypt(
                userAKeysFromInternalStorage.public_key, userAKeysFromInternalStorage.private_key
            ).cipher);
        let grantChannelArray = [];

        const statusUpdate = {
            id: uuid(),
            stream_id: streamId,
            recorded_at: statusDate,
            payload: encryptPayload(originalPayload, userAKeysFromInternalStorage.public_key),
            marker: {
                started: true,
                frequency: '15m',
                stopped: null
            }
        }

        const saveStatusUpdates = {
            status_updates: [
                statusUpdate
            ]
        };

        await agent.post('/api/v1/status')
            .auth(userAToken, authType)
            .send(saveStatusUpdates)
            .expect(201);

        const restKeys = await agent
            .post(`/api/v1/identity/keys/search`)
            .auth(userAToken, authType)
            .send({ gid_uuid: userBid, purpose: Purpose.status_sharing })
            .expect('Content-Type', /json/)
            .expect(201);

        const keyPublic_key = restKeys?.body?.data?.attributes?.key_pairs[0].public_key;

        const reEncryptionKey = cryptosdk.PRE.generateReEncryptionKey(
            userAKeysFromInternalStorage.private_key,
            keyPublic_key
        );

        for (let i = 0; i < count; i++) {
            const {id} = await prepareGrantAndExpect(userAToken, fromDate, toDate,
                reEncryptionKey, userBid,{streamId, type: grantType});
            grantChannelArray.push(CHANNEL_PREFIX + id);
        }
        return {streamId, userBToken};
    }

    async function prepareUserKeys() {
        const userAid = uuid();
        const userBid = uuid();

        const userAToken = getAccessToken(allScopes, userAid);
        const userBToken = getAccessToken(allScopes, userBid);

        const userAKeysFromInternalStorage = cryptosdk.PRE.generateKeyPair();
        const userBKeysFromInternalStorage = cryptosdk.PRE.generateKeyPair();

        const userBKeyPair = {
            public_key: userBKeysFromInternalStorage.public_key,
            encrypted_private_key: cryptosdk.PRE.encrypt(
                userBKeysFromInternalStorage.public_key, userBKeysFromInternalStorage.private_key
            ).cipher,
            purpose: Purpose.status_sharing,
            algorithm_type: AlgorithmType.ec
        };

        await agent
            .post('/api/v1/identity/me/keys')
            .set('Accept', 'application/json')
            .auth(userBToken, authType)
            .send(userBKeyPair)
            .expect('Content-Type', /json/)
            .expect(201);
        return {userBid, userAToken, userBToken, userAKeysFromInternalStorage};
    }

    describe('cache e2e', () => {
        it('e2e should fail with range is not granted when create stream with multiple grants and get stream by range',
            async () => {
            // Arrange
            let fromDate = "2022-04-25T00:00:00.000Z";
            let toDate = "2022-04-30T00:00:00.000Z";
            let {streamId, userBToken} = await prepareGrantEntities(3, GrantType.range, fromDate, toDate);

            // Act
            fromDate = "2022-04-20T00:00:00.000Z";
            toDate = "2022-04-30T00:00:00.000Z";
            const {body} = await agent
                .post(`/api/v1/status/data/${streamId}`)
                .auth(userBToken, authType)
                .send({fromDate, toDate})
                .expect(500);

            // Assert
            expect(body.errors[0].title).toEqual("Range is not granted");
        });

        it('e2e should create stream latest type grant and get stream latest', async () => {
            // Arrange
            const fromDate = "2022-04-25T00:00:00.000Z";
            const toDate = "2022-04-30T00:00:00.000Z";
            let {streamId, userBToken} = await prepareGrantEntities(1, GrantType.latest, fromDate, toDate);

            // Act
            const {body} = await agent
                .post(`/api/v1/status/data/${streamId}`)
                .auth(userBToken, authType)
                .send({fromDate, toDate})
                .expect(201);

            // Assert
            const { data: statusUpdates } = body;
            expect(statusUpdates).not.toBeNull();
            expect(statusUpdates[0].attributes.stream_id).toEqual(streamId);
        });

        it('e2e should create stream latest type grant different date range, get stream latest no records', async () => {
            // Arrange
            const fromDate = "2022-05-01T00:00:00.000Z";
            const toDate = "2022-05-10T00:00:00.000Z";
            let {streamId, userBToken} = await prepareGrantEntities(1, GrantType.latest, fromDate, toDate);

            // Act
            const {body} = await agent
                .post(`/api/v1/status/data/${streamId}`)
                .auth(userBToken, authType)
                .send({fromDate, toDate})
                .expect(201);

            // Assert
            const { data: statusUpdates } = body;
            expect(statusUpdates).toEqual([]);
        });

        it('e2e should fail with grant not found when stream create grants, get stream by range with different range',
            async () => {
            // Arrange
            let fromDate = "2022-04-20T00:00:00.000Z";
            let toDate = "2022-04-30T00:00:00.000Z";
            let {streamId, userBToken} =
                await prepareGrantEntities(1, GrantType.range, fromDate, toDate);

            fromDate = "2022-05-01T00:00:00.000Z";
            toDate = "2022-05-30T00:00:00.000Z";

            // Act
            const {body} = await agent
                .post(`/api/v1/status/data/${streamId}`)
                .auth(userBToken, authType)
                .send({fromDate, toDate})
                .expect(404);

            // Assert
            expect(body.errors[0].title).toEqual("grant not found");
        });

        it('e2e should fail with grant not found when created stream with no grants and get stream by range',
            async () => {
            // Arrange
            const fromDate = "2022-04-20T00:00:00.000Z";
            const toDate = "2022-04-30T00:00:00.000Z";
            let {streamId, userBToken} =
                await prepareGrantEntities(0, GrantType.range, fromDate, toDate);

            // Act
            const {body} = await agent
                .post(`/api/v1/status/data/${streamId}`)
                .auth(userBToken, authType)
                .send({fromDate, toDate})
                .expect(404);

            // Assert
            expect(body.errors[0].title).toEqual("grant not found");
        });
    })

    afterAll(async () => {
        await app.close();
    });
})
