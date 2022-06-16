import {AmqpService} from '@globalid/nest-amqp'

import { Test } from '@nestjs/testing';
import { CacheService } from '../../../src/products/services/cache.service';
import { GrantSubscriber } from '../../src/subscribers/grant.subscriber';
import {v4 as uuid} from 'uuid';
import * as sinon from 'sinon';

describe('Grant Subscriber', () => {
    let grantSubscriber: GrantSubscriber;
    let cacheService;
    let amqpService;
    let sender;

    beforeEach(async () => {
      cacheService = {};

      sender = sinon.spy(() => {});

      amqpService = {
        getPublisher: jest.fn(() => sender),
      };

      const module = await Test.createTestingModule({
          controllers: [],
          providers: [
            GrantSubscriber,
            {
              provide: CacheService,
              useValue: cacheService
            },
            {
              provide: AmqpService,
              useValue: amqpService
            }
          ],
      }).compile();

      grantSubscriber = module.get<GrantSubscriber>(GrantSubscriber);
    });

    describe('handleStatusUpdateEvent', () => {
      it('should republish statusUpdate with reencryption key', async () => {
        const firstGrantId = uuid();
        const secondGrantId = uuid();
        const streamId = uuid();
        const recipient_id = uuid();
        const firstReEncryptionKey = 'firstReEncryptionKey';
        const secondReEncryptionKey = 'secondReEncryptionKey';

        const statusUpdate = {
          id: uuid(),
          user_id: uuid(),
          stream_id: streamId,
          recipient_id,
          recorded_at: '2022-04-28T23:05:46.944Z',
          payload: 'encrypted payload',
        }

        const cacheMap = {
          [`stream_key: ${streamId}`]: [{id: firstGrantId, recipient_id}, {id: secondGrantId, recipient_id}],
          [`grant_key: ${firstGrantId}`]: firstReEncryptionKey,
          [`grant_key: ${secondGrantId}`]: secondReEncryptionKey,
        }

        cacheService.builtGrantsPerStreamKey = sinon.spy((key) => `stream_key: ${key}`);
        cacheService.builtReEncryptionPerGrantKey = sinon.spy((key) => `grant_key: ${key}`);
        cacheService.get = sinon.spy((key) => (cacheMap[key]));
        cacheService.smembers = sinon.spy((key) => (cacheMap[key]))
        await grantSubscriber.handleStatusUpdateEvent(statusUpdate);

        expect(cacheService.builtGrantsPerStreamKey.calledOnce).toBeTruthy();
        expect(cacheService.builtGrantsPerStreamKey.args[0][0]).toEqual(streamId);

        expect(cacheService.builtReEncryptionPerGrantKey.callCount).toEqual(2);
        expect(cacheService.builtReEncryptionPerGrantKey.args[0][0]).toEqual(firstGrantId);
        expect(cacheService.builtReEncryptionPerGrantKey.args[1][0]).toEqual(secondGrantId);

        expect(cacheService.get.callCount).toEqual(2);
        expect(cacheService.get.args[0][0]).toEqual(`grant_key: ${firstGrantId}`);
        expect(cacheService.get.args[1][0]).toEqual(`grant_key: ${secondGrantId}`);

        expect(sender.callCount).toEqual(2);
        expect(sender.args[0][0]).toEqual({ ...statusUpdate, grant_id: firstGrantId, reEncryptionKey: firstReEncryptionKey });
        expect(sender.args[1][0]).toEqual({ ...statusUpdate, grant_id: secondGrantId, reEncryptionKey: secondReEncryptionKey });
      });
    });
});
