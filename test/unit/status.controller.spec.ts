import {Test} from '@nestjs/testing';
import {StatusController} from '../../src/products/controllers/status.controller';
import {StreamService} from '../../src/products/services/stream.service';
import {StreamRepository} from '../../src/products/repositories/stream.repository';
import {v4 as uuid} from 'uuid';
import {KeystoreService} from '../../src/products/services/keystore';
import {StatusService} from "../../src/products/services/status.service";
import {MessageHandler} from '@globalid/nest-amqp';
import {StatusDto} from "../../src/products/dto/status.model";
import {StatusRepository} from "../../src/products/repositories/status.repository";
import {StatusPublisher} from "../../src/products/rabbit/status.publisher";
import {getAccessToken} from "../getacctoken";
import {TokenData, TokenModule} from '@globalid/nest-auth';
import {plainToClass} from 'class-transformer';
import {JwtService} from '@nestjs/jwt';
import {ConfigModule} from '@nestjs/config';
import {CONFIG_VALIDATION_SCHEMA, configuration} from "../../src/products/config/config";
import {StreamTypeService} from "../../src/products/services/stream_type.service";
import {StreamTypeRepository} from "../../src/products/repositories/stream_type.repository";
import {StreamEntity} from "../../src/products/entity/stream.entity";

class Handlers {
  collectedMessages: [] = []

  getCollectedMessages(): string[] {
    return [...this.collectedMessages]
  }

  clearCollectedMessages(): void {
    this.collectedMessages = [];
  }

  @MessageHandler({})
  async updateAdd(evt: StatusDto): Promise<void> {
    this.collectedMessages.push(evt as never)
  }
}

describe('Status Controller', () => {
  let statusController: StatusController;
  let streamService: StreamService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TokenModule,
        ConfigModule.forRoot({
          validationSchema: CONFIG_VALIDATION_SCHEMA,
          validationOptions: {
            allowUnknown: true,
            abortEarly: true,
          },
          isGlobal: true,
          load: [configuration]
        })],
      controllers: [StatusController],
      providers: [
        StreamService,
        StreamTypeService,
        StatusService,
        {
          provide: KeystoreService,
          useValue: {}
        },
        {
          provide: StreamRepository,
          useValue: {}
        },
        {
          provide: StreamTypeRepository,
          useValue: {}
        },
        {
          provide: StatusRepository,
          useValue: {}
        },
        {
          provide: StatusPublisher,
          useValue: {}
        }
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    statusController = module.get<StatusController>(StatusController);
    streamService = module.get<StreamService>(StreamService);
  });

  describe('createStream', () => {
    it('should create stream', async () => {
      const streamId = uuid();
      streamService.create = jest.fn(async () => {
        return {
          "id": streamId,
          "owner_id": "f7b0c885-74d3-4c78-943d-c6cad1e62aaf",
          "type": "test",
          "keypair_id": "17503e40-2be9-45a3-adc4-d86915bc908c",
          "device_id": "6e9e5ec5-e260-43df-a8e1-b3f34b8cb9fb",
          "created_at": "2022-04-30T19:06:06.669Z",
          "updated_at": "2022-04-30T19:06:06.669Z"
        } as StreamEntity;
      });

      const req = {
        headers: {
          authorization: 'Bearer token',
        }
      }
      const body = {
        stream_type: 'streamType',
        encrypted_private_key: 'someValidRandomKey',
        public_key: 'someValidRandomKey',
      }

      const token = getAccessToken();
      const decodedToken = jwtService.decode(token);
      const tokenData = plainToClass(TokenData, decodedToken);

      const response = await statusController.createStream(req, tokenData, body);

      expect(response.id).toEqual(streamId);
    });
  });
});
