import {Global, INestApplication, MiddlewareConsumer, Module, NestModule} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import * as supertest from "supertest";
import {getAccessToken} from "../getacctoken";
import { StatusModule } from "../../src/products/modules/status.module";
import { AmqpModule } from "@globalid/nest-amqp";
import { CONFIG_VALIDATION_SCHEMA, RABBIT_URI } from "../../src/products/config/config";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import config from "./ormconfig";
import { StreamEntity } from "../../src/products/entity/stream.entity";
import { GrantEntity } from "../../src/products/entity/grant.entity";
import { StreamTypeEntity } from "../../src/products/entity/stream_type.entity";
import { Pot } from "../../src/products/entity/pot.entity";
import { Container } from "../../src/products/entity/container.entity";
import { FileRepository } from "../../src/products/repositories/file.repository";
import { StatusRepository } from "../../src/products/repositories/status.repository";
import { UserRepository } from "../../src/products/repositories/user.repository";
import { UserActionEntity } from "../../src/products/entity/user_action.entity";
import { TimezoneEntity } from "../../src/products/entity/tz.entity";
import { StatusEntity } from "../../src/products/entity/status.entity";
import { RegionEntity } from "../../src/products/entity/region.entity";
import { NotificationStatusEntity } from "../../src/products/entity/notification_status.entity";
import { GpsEntity } from "../../src/products/entity/gps.entity";
import { DeviceModelEntity } from "../../src/products/entity/device_model.entity";
import { DeviceEntity } from "../../src/products/entity/device.entity";
import { CountryCodeEntity } from "../../src/products/entity/country_code.entity";
import { UserEntity } from "../../src/products/entity/user.entity";
import { FileEntity } from "../../src/products/entity/file.entity";
import { JwtModule } from '@nestjs/jwt'
import { TokenMiddleware } from "@globalid/nest-auth";
import {v4 as uuid} from 'uuid';

jest.setTimeout(60 * 1000);


@Global()
@Module({
  imports: [
    ConfigService,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_PUBLIC_KEY'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [JwtModule],
})
class TokenModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TokenMiddleware).forRoutes('*')
  }
}

describe('StatusController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.NODE_ENV = 'debugsstatus';
    process.env.SDK_CUSTOM_API_URL = 'http://localhost';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TokenModule,
        TypeOrmModule.forRoot({
          ...config,
          entities: [
            FileEntity,
            FileRepository,
            UserRepository,
            UserEntity,
            CountryCodeEntity,
            DeviceEntity,
            DeviceModelEntity,
            GpsEntity,
            NotificationStatusEntity,
            RegionEntity,
            StatusEntity,
            TimezoneEntity,
            UserActionEntity,
            UserRepository,
            StatusRepository,
            FileRepository,
            Container,
            Pot,
            StreamEntity,
            StreamTypeEntity,
            GrantEntity
          ]
        }),
        AmqpModule.forConfig({
          urlOrOpts: RABBIT_URI,
            defaultValidationOptions: { classTransform: { enableImplicitConversion: true }, validate: true },
        }),
        ConfigModule.forRoot({
            validationSchema: CONFIG_VALIDATION_SCHEMA,
            validationOptions: {
                allowUnknown: true,
                abortEarly: true,
            },
            isGlobal: true
        }),
        StatusModule
      ],
      providers: []
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/status/streams', () => {
    it('should return the streamId', async () => {
      const accessToken = getAccessToken();

      const streamType = uuid();
      const streamTypeData = {
        granularity     : 'single',
        stream_handling : 'lockbox',
        approximated    : true,
        supported_grants: ['range'],
        type            : streamType,
      };
      const streamData = {
        "streamType": streamType,
        "publicKey": "Ut incididuntelit labore",
        "encryptedPrivateKey": "Duis Excepteur culpa reprehenderit esse",
      };

      // Run your end-to-end test
      await supertest.agent(app.getHttpServer())
        .post('/api/v1/status/streams/types')
        .set('Accept', 'application/json')
        .auth(accessToken, {type: "bearer"})
        .send(streamTypeData)
        .expect('Content-Type', /json/)
        .expect(201);


        // Run your end-to-end test
        const { text } = await supertest.agent(app.getHttpServer())
            .put('/api/v1/status/streams')
            .set('Accept', 'text/plain')
            .auth(accessToken, {type: "bearer"})
            .send(streamData)
            .expect('Content-Type', /text\/html/)
            .expect(200);

        expect(typeof text).toBe('string');
        expect(text).toHaveLength(36);
    });
  });

  describe('GET /api/v1/status/streams/types', () => {
    it('should get all streamTypes', async () => {
      const accessToken = getAccessToken();

      const streamType = uuid();
      const streamTypeOutput = {
        "id"            : expect.any(String),
        "granularity"     : 'single',
        "stream_handling" : 'lockbox',
        "approximated"    : true,
        "supported_grants": ['range'],
        "type"            : streamType,
        "updated_at"      : expect.any(String),
        "created_at"      : expect.any(String)
      };

      const streamTypeData = {
        granularity     : 'single',
        stream_handling : 'lockbox',
        approximated    : true,
        supported_grants: ['range'],
        type            : streamType,
      };


      // Run your end-to-end test
      await supertest.agent(app.getHttpServer())
        .post('/api/v1/status/streams/types')
        .set('Accept', 'application/json')
        .auth(accessToken, {type: "bearer"})
        .send(streamTypeData)
        .expect('Content-Type', /json/)
        .expect(201);

      // Run your end-to-end test
      const {body} = await supertest.agent(app.getHttpServer())
        .get('/api/v1/status/streams/types')
        .set('Accept', 'application/json')
        .auth(accessToken, {type: "bearer"})
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining(streamTypeOutput)
        ])
      )
    });
  });

  describe('POST /api/v1/status/streams/types', () => {
    it('should create streamType', async () => {

      const accessToken = getAccessToken();

      const streamType = uuid();
      const streamTypeOutput = {
        "id"              : expect.any(String),
        "granularity"     : 'single',
        "stream_handling" : 'lockbox',
        "approximated"    : true,
        "supported_grants": ['range'],
        "type"            : streamType,
        "updated_at"      : expect.any(String),
        "created_at"      : expect.any(String)
      };

      const streamTypeData = {
        granularity     : 'single',
        stream_handling : 'lockbox',
        approximated    : true,
        supported_grants: ['range'],
        type            : streamType,
      };

      // Run your end-to-end test
      const {body} = await supertest.agent(app.getHttpServer())
        .post('/api/v1/status/streams/types')
        .set('Accept', 'application/json')
        .auth(accessToken, {type: "bearer"})
        .send(streamTypeData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(body).toEqual({...streamTypeOutput});
    });
  });
});
