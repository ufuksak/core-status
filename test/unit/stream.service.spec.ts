import { Test } from '@nestjs/testing';
import { StreamService } from '../../src/products/services/stream.service';
import { StreamRepository } from '../../src/products/repositories/stream.repository';
import {v4 as uuid} from 'uuid';
import { KeystoreService } from '../../src/products/services/keystore';
import * as sinon from 'sinon'
import {StatusService} from "../../src/products/services/status.service";
import {StatusRepository} from "../../src/products/repositories/status.repository";
import {StatusPublisher} from "../../src/products/rabbit/status.publisher";

describe('Status Service', () => {
    let streamService: StreamService;
    let keystoreService;
    let streamRepository;
    let streamPublisher;
    let statusRepository;

    beforeAll(async () => {
      keystoreService = {
        createKeystoreKeyByMe: jest.fn().mockReturnThis(),
      };

      streamRepository = {
        verify: jest.fn().mockReturnThis(),
      };

      statusRepository = {
        verify: jest.fn().mockReturnThis(),
      };

      streamPublisher = {
        verify: jest.fn().mockReturnThis(),
      };

        const module = await Test.createTestingModule({
            controllers: [],
            providers: [
              StreamService,
              StatusService,
              {
                provide: KeystoreService,
                useValue: keystoreService
              },
              {
                provide: StreamRepository,
                useValue: streamRepository
              },
              {
                provide: StatusRepository,
                useValue: statusRepository
              },
              {
                provide: StatusPublisher,
                useValue: streamPublisher
              }
            ],
        }).compile();

        streamService = module.get<StreamService>(StreamService);
    });

    describe('save', () => {
        it('should create stream', async () => {
            const streamId = uuid();

            const token = 'Bearer token'
            const streamType = 'some'
            const encryptedPrivateKey = 'test'
            const publicKey = 'test'

            const keystore = { client_id: uuid(), uuid: uuid(), device_id: uuid()}

            keystoreService.createKeystoreKeyByMe = sinon.spy(() => (keystore))
            streamRepository.saveStream = sinon.spy(() => ({ id: streamId }));

            const response = await streamService.save(token, streamType, encryptedPrivateKey, publicKey);

            expect(response).toEqual(streamId);

            expect(keystoreService.createKeystoreKeyByMe.calledOnce).toBeTruthy();
            expect(keystoreService.createKeystoreKeyByMe.args[0][0]).toEqual(token);
            expect(keystoreService.createKeystoreKeyByMe.args[0][1]).toHaveProperty('encrypted_private_key', encryptedPrivateKey);
            expect(keystoreService.createKeystoreKeyByMe.args[0][1]).toHaveProperty('public_key', publicKey);
            expect(keystoreService.createKeystoreKeyByMe.args[0][1]).toHaveProperty('purpose', 'status');
            expect(keystoreService.createKeystoreKeyByMe.args[0][1]).toHaveProperty('algorithm_type', 'ec');

            expect(streamRepository.saveStream.calledOnce).toBeTruthy();
            expect(streamRepository.saveStream.args[0][0]).toHaveProperty('type', streamType);
            expect(streamRepository.saveStream.args[0][0]).toHaveProperty('owner_id', keystore.client_id);
            expect(streamRepository.saveStream.args[0][0]).toHaveProperty('keypair_id', keystore.uuid);
            expect(streamRepository.saveStream.args[0][0]).toHaveProperty('device_id', keystore.device_id);
        });
    });
});
