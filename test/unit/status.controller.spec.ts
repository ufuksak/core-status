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

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            controllers: [StatusController],
            providers: [
              StreamService,
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
                provide: StatusRepository,
                useValue: {}
              },
              {
                provide: StatusPublisher,
                useValue: {}
              }
            ],
        }).compile();

        statusController = module.get<StatusController>(StatusController);
        streamService = module.get<StreamService>(StreamService);
    });

    describe('createStream', () => {
        it('should create stream', async () => {
            const streamId = uuid();
            streamService.save = jest.fn(async () =>streamId);

            const req = {
              headers: {
                authorization: 'Bearer token',
              }
            }
            const body = {
              streamType: 'streamType',
              encryptedPrivateKey: 'test',
              publicKey: 'test',
            }

            const response = await statusController.createStream(req, body);

            expect(response).toEqual(streamId);
        });
    });
});
