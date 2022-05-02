import { Test } from '@nestjs/testing';
import { StreamService } from '../../src/products/services/stream.service';
import { StreamRepository } from '../../src/products/repositories/stream.repository';
import {v4 as uuid} from 'uuid';
import { KeystoreService } from '../../src/products/services/keystore';
import * as sinon from 'sinon'

describe('Status Service', () => {
    let streamService: StreamService;
    let keystoreService;
    let streamRepository;

    beforeAll(async () => {
      keystoreService = {
        createKeystoreKeyByMe: jest.fn().mockReturnThis(),
      };

      streamRepository = {
        verify: jest.fn().mockReturnThis(),
      };
        const module = await Test.createTestingModule({
            controllers: [],
            providers: [
              StreamService,
              {
                provide: KeystoreService,
                useValue: keystoreService
              },
              {
                provide: StreamRepository,
                useValue: streamRepository
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
            const client_id = uuid()

            const keystore = { client_id: uuid(), uuid: uuid(), device_id: uuid()}

            keystoreService.createKeystoreKeyByMe = sinon.spy(() => (keystore))
            streamRepository.saveStream = sinon.spy(() => ({ id: streamId }));

            const response = await streamService.save(token, client_id, streamType, encryptedPrivateKey, publicKey);

            expect(response).toEqual(streamId);

            expect(keystoreService.createKeystoreKeyByMe.calledOnce).toBeTruthy();
            expect(keystoreService.createKeystoreKeyByMe.args[0][0]).toEqual(token);
            expect(keystoreService.createKeystoreKeyByMe.args[0][1]).toHaveProperty('encrypted_private_key', encryptedPrivateKey);
            expect(keystoreService.createKeystoreKeyByMe.args[0][1]).toHaveProperty('public_key', publicKey);
            expect(keystoreService.createKeystoreKeyByMe.args[0][1]).toHaveProperty('purpose', 'status-stream');
            expect(keystoreService.createKeystoreKeyByMe.args[0][1]).toHaveProperty('algorithm_type', 'ec');

            expect(streamRepository.saveStream.calledOnce).toBeTruthy();
            expect(streamRepository.saveStream.args[0][0]).toHaveProperty('type', streamType);
            expect(streamRepository.saveStream.args[0][0]).toHaveProperty('owner_id', client_id);
            expect(streamRepository.saveStream.args[0][0]).toHaveProperty('keypair_id', keystore.uuid);
            expect(streamRepository.saveStream.args[0][0]).toHaveProperty('device_id', keystore.device_id);
        });
    });
});
