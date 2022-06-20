import {Test, TestingModule} from '@nestjs/testing';
import {StatusService} from '../../src/products/services/status.service';
import {StatusRepository} from "../../src/products/repositories/status.repository";
import {getRepositoryToken} from "@nestjs/typeorm";
import {v4 as uuid} from 'uuid';
import {StatusPublisher} from "../../src/products/rabbit/status.publisher";
import {StreamRepository} from "../../src/products/repositories/stream.repository";
import {StreamTypeService} from "../../src/products/services/stream_type.service";
import {StreamTypeRepository} from "../../src/products/repositories/stream_type.repository";
import { GrantService } from '../../src/products/services/grant.service';
import { CacheService } from '../../src/products/services/cache.service';
import * as sinon from 'sinon';
import * as utils from '../../src/products/util/pre';
import * as cryptosdk from '@articice/globalid-crypto-library-pre';


const userId = uuid();
const streamId = uuid();

const mockedStreams =  [{
  id: streamId,
  owner_id: userId,
  type: "test",
  keypair_id: "17503e40-2be9-45a3-adc4-d86915bc908c",
  device_id: "6e9e5ec5-e260-43df-a8e1-b3f34b8cb9fb",
  created_at: "2022-04-30T19:06:06.669Z",
  updated_at: "2022-04-30T19:06:06.669Z"
}]

describe('StatusService', () => {
  let service: StatusService;
  let queryBuilder: any;
  let grantService: any;
  let cacheService: any;
  let statusRepository: any;

  beforeEach(async () => {
    queryBuilder = ({
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn().mockReturnThis(),
    })

    grantService = {}
    cacheService = {}
    statusRepository = {
      createQueryBuilder: jest.fn(() => queryBuilder),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusService,
        StreamTypeService,
        {
          provide: GrantService,
          useValue: grantService
        },
        {
          provide: CacheService,
          useValue: cacheService
        },
        {
          provide: getRepositoryToken(StatusRepository),
          useFactory: jest.fn(() => (statusRepository)),
        },
        {
          provide: getRepositoryToken(StreamRepository),
          useFactory: jest.fn(() => ({
            createQueryBuilder: jest.fn(() => queryBuilder),
            getStream: jest.fn(() => mockedStreams),
          })),
        },
        {
          provide: getRepositoryToken(StreamTypeRepository),
          useFactory: jest.fn(() => ({
            createQueryBuilder: jest.fn(() => queryBuilder),
          })),
        },
        {
          provide: StatusPublisher,
          useValue: {
            publishStatusUpdate: jest.fn((update) => {})
          }
        }
      ],
    }).compile();
    service = await module.get<StatusService>(StatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create method', () => {
    it('should create status', async () => {
      const expectedStatusId = uuid();
      const status = [{
        id: expectedStatusId,
        stream_id: streamId,
        recorded_at: "2022-04-28T23:05:46.944Z",
        payload: "mockPayload",
        marker: {
          started: true,
          stopped: false,
          frequency: '15m'
        }
      }];

      queryBuilder.execute = jest.fn(() => ({
        generatedMaps:[{
          uploaded_at: new Date(),
        }]
      }));

      const response = await service.save(userId, status);

      expect(response[0].id).toEqual(expectedStatusId);
    });
  })

  describe('getUserStatusByStreamId', () => {
    it('should set reEncrypted payload to cache', async () => {
      const recipient_id = uuid();
      const streamId = uuid();

      const keyPair1 = cryptosdk.PRE.generateKeyPair();
      const keyPair2 = cryptosdk.PRE.generateKeyPair();

      const timeRange = {
        fromDate: "2022-04-20T23:05:46.944Z",
        toDate: "2022-04-28T23:05:46.944Z"
      };

      const reEncryptionKey = cryptosdk.PRE.generateReEncryptionKey(
        keyPair1.private_key,
        keyPair2.public_key,
      );

      const grants = [{
        id: uuid(),
        stream_id: streamId,
        recipient_id: recipient_id,
        created_at: new Date("2022-04-20T23:05:46.944Z"),
        updated_at: new Date("2022-04-20T23:05:46.944Z"),
        fromDate  : new Date("2022-04-20T00:00:00.000Z"),
        toDate    : new Date("2022-04-30T00:00:00.000Z"),
        properties: {
          e2eKey: 'pre',
          reEncryptionKey
        }
      }];

      const firstPayload = 'test payload';
      const firstEncryptedPayload = utils.encryptPayload(firstPayload, keyPair1.public_key);
      const firstReEncryptedPayload = utils.reEncryptPayload(firstEncryptedPayload, reEncryptionKey);
      const secondPayload = 'mockPayload';
      const secondEncryptedPayload = utils.encryptPayload(secondPayload, keyPair1.public_key);
      const secondReEncryptedPayload = utils.reEncryptPayload(secondEncryptedPayload, reEncryptionKey);

      const status = [{
        id: uuid(),
        stream_id: streamId,
        recorded_at: new Date("2022-04-25T23:05:46.944Z"),
        payload: firstEncryptedPayload,
        marker: {
          started: true,
          stopped: false,
          frequency: '15m'
        }
      },
      {
        id: uuid(),
        stream_id: streamId,
        recorded_at: new Date("2022-04-25T23:05:46.944Z"),
        payload: secondEncryptedPayload,
        marker: {
          started: true,
          stopped: false,
          frequency: '15m'
        }
      }];

      grantService.getByRange = sinon.spy(() => grants);
      grantService.checkContinuousRange = sinon.spy(() => {});

      statusRepository.find = sinon.spy(() => status);

      cacheService.buildStatusUpdateKey = sinon.spy((recipient_id: string, stream_id: string, update_id:string) => (
        `${recipient_id}:${stream_id}:${update_id}`
      ));
      cacheService.get = sinon.spy(() => {});
      cacheService.set = sinon.spy(() => {});

      const statusUpdates = await service.getUserStatusByStreamId(recipient_id, streamId, timeRange);

      expect(grantService.getByRange.calledOnce).toBeTruthy();
      expect(grantService.getByRange.args[0][0]).toEqual(recipient_id);
      expect(grantService.getByRange.args[0][1]).toEqual(streamId);
      expect(grantService.getByRange.args[0][2]).toEqual(timeRange);

      expect(grantService.checkContinuousRange.calledOnce).toBeTruthy();
      expect(grantService.checkContinuousRange.args[0][0]).toEqual(grants);
      expect(grantService.checkContinuousRange.args[0][1]).toEqual(timeRange);

      expect(statusRepository.find.calledOnce).toBeTruthy();

      expect(cacheService.buildStatusUpdateKey.callCount).toEqual(2);
      expect(cacheService.buildStatusUpdateKey.args[0][0]).toEqual(recipient_id);
      expect(cacheService.buildStatusUpdateKey.args[0][1]).toEqual(streamId);
      expect(cacheService.buildStatusUpdateKey.args[0][2]).toEqual(status[0].id);
      expect(cacheService.buildStatusUpdateKey.args[1][0]).toEqual(recipient_id);
      expect(cacheService.buildStatusUpdateKey.args[1][1]).toEqual(streamId);
      expect(cacheService.buildStatusUpdateKey.args[1][2]).toEqual(status[1].id);

      expect(cacheService.get.callCount).toEqual(2);
      expect(cacheService.get.args[0][0]).toEqual(`${recipient_id}:${streamId}:${status[0].id}`);
      expect(cacheService.get.args[1][0]).toEqual(`${recipient_id}:${streamId}:${status[1].id}`);

      expect(cacheService.set.callCount).toEqual(2);
      expect(cacheService.set.args[0][0]).toEqual(`${recipient_id}:${streamId}:${status[0].id}`);
      expect(cacheService.set.args[0][1]).toEqual(firstReEncryptedPayload);
      expect(cacheService.set.args[1][0]).toEqual(`${recipient_id}:${streamId}:${status[1].id}`);
      expect(cacheService.set.args[1][1]).toEqual(secondReEncryptedPayload);

      expect(statusUpdates[0]).toHaveProperty('payload', firstReEncryptedPayload);
      expect(statusUpdates[1]).toHaveProperty('payload', secondReEncryptedPayload);

      expect(utils.decryptPayload(statusUpdates[0].payload, keyPair2.private_key)).toEqual(firstPayload);
      expect(utils.decryptPayload(statusUpdates[1].payload, keyPair2.private_key)).toEqual(secondPayload);
    });

    it('should get reEncrypted payload from cache', async () => {
      const recipient_id = uuid();
      const streamId = uuid();

      const keyPair1 = cryptosdk.PRE.generateKeyPair();
      const keyPair2 = cryptosdk.PRE.generateKeyPair();

      const timeRange = {
        fromDate: "2022-04-20T23:05:46.944Z",
        toDate: "2022-04-28T23:05:46.944Z"
      };

      const reEncryptionKey = cryptosdk.PRE.generateReEncryptionKey(
        keyPair1.private_key,
        keyPair2.public_key,
      );

      const grants = [{
        id: uuid(),
        stream_id: streamId,
        recipient_id: recipient_id,
        created_at: new Date("2022-04-20T23:05:46.944Z"),
        updated_at: new Date("2022-04-20T23:05:46.944Z"),
        fromDate  : new Date("2022-04-20T00:00:00.000Z"),
        toDate    : new Date("2022-04-30T00:00:00.000Z"),
        properties: {
          e2eKey: 'pre',
          reEncryptionKey
        }
      }];

      const firstPayload = 'test payload';
      const firstEncryptedPayload = utils.encryptPayload(firstPayload, keyPair1.public_key);
      const firstReEncryptedPayload = utils.reEncryptPayload(firstEncryptedPayload, reEncryptionKey);
      const secondPayload = 'mockPayload';
      const secondEncryptedPayload = utils.encryptPayload(secondPayload, keyPair1.public_key);
      const secondReEncryptedPayload = utils.reEncryptPayload(secondEncryptedPayload, reEncryptionKey);

      const status = [{
        id: uuid(),
        stream_id: streamId,
        recorded_at: new Date("2022-04-25T23:05:46.944Z"),
        payload: firstEncryptedPayload,
        marker: {
          started: true,
          stopped: false,
          frequency: '15m'
        }
      },
      {
        id: uuid(),
        stream_id: streamId,
        recorded_at: new Date("2022-04-25T23:05:46.944Z"),
        payload: secondEncryptedPayload,
        marker: {
          started: true,
          stopped: false,
          frequency: '15m'
        }
      }];

      grantService.getByRange = sinon.spy(() => grants);
      grantService.checkContinuousRange = sinon.spy(() => {});

      statusRepository.find = sinon.spy(() => status);

      cacheService.buildStatusUpdateKey = sinon.spy((recipient_id: string, stream_id: string, update_id:string) => (
        `${recipient_id}:${stream_id}:${update_id}`
      ));

      const reEncryptPayload = utils.reEncryptPayload;

      cacheService.get = sinon.spy((key) => {
        const [recipient_id, stream_id, update_id] = key.split(':');

        const statusUpdate = status.find(s => s.id === update_id);

        return reEncryptPayload(statusUpdate.payload, reEncryptionKey);
      });

      cacheService.set = sinon.spy(() => {});

      const spyReEncryptPayload = sinon.spy((payload: string, reEncryptionKey: string) => (''));

      const stubReEncryptPayload = sinon.stub(utils, 'reEncryptPayload').callsFake(spyReEncryptPayload);

      const statusUpdates = await service.getUserStatusByStreamId(recipient_id, streamId, timeRange);

      stubReEncryptPayload.restore();

      expect(grantService.getByRange.calledOnce).toBeTruthy();
      expect(grantService.getByRange.args[0][0]).toEqual(recipient_id);
      expect(grantService.getByRange.args[0][1]).toEqual(streamId);
      expect(grantService.getByRange.args[0][2]).toEqual(timeRange);

      expect(grantService.checkContinuousRange.calledOnce).toBeTruthy();
      expect(grantService.checkContinuousRange.args[0][0]).toEqual(grants);
      expect(grantService.checkContinuousRange.args[0][1]).toEqual(timeRange);

      expect(statusRepository.find.calledOnce).toBeTruthy();

      expect(cacheService.buildStatusUpdateKey.callCount).toEqual(2);
      expect(cacheService.buildStatusUpdateKey.args[0][0]).toEqual(recipient_id);
      expect(cacheService.buildStatusUpdateKey.args[0][1]).toEqual(streamId);
      expect(cacheService.buildStatusUpdateKey.args[0][2]).toEqual(status[0].id);
      expect(cacheService.buildStatusUpdateKey.args[1][0]).toEqual(recipient_id);
      expect(cacheService.buildStatusUpdateKey.args[1][1]).toEqual(streamId);
      expect(cacheService.buildStatusUpdateKey.args[1][2]).toEqual(status[1].id);

      expect(cacheService.get.callCount).toEqual(2);
      expect(cacheService.get.args[0][0]).toEqual(`${recipient_id}:${streamId}:${status[0].id}`);
      expect(cacheService.get.args[1][0]).toEqual(`${recipient_id}:${streamId}:${status[1].id}`);

      expect(cacheService.set.notCalled).toBeTruthy();
      expect(spyReEncryptPayload.notCalled).toBeTruthy();

      expect(statusUpdates[0]).toHaveProperty('payload', firstReEncryptedPayload);
      expect(statusUpdates[1]).toHaveProperty('payload', secondReEncryptedPayload);

      expect(utils.decryptPayload(statusUpdates[0].payload, keyPair2.private_key)).toEqual(firstPayload);
      expect(utils.decryptPayload(statusUpdates[1].payload, keyPair2.private_key)).toEqual(secondPayload);
    });
  })

});
