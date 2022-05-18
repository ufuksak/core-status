import {Test, TestingModule} from '@nestjs/testing';
import {expect} from './setup';
import * as sinon from 'sinon';
import {getRepositoryToken} from "@nestjs/typeorm";
import {StatusPublisher} from "../../src/products/rabbit/status.publisher";
import {StreamRepository} from "../../src/products/repositories/stream.repository";
import {SubscribersService} from "../../src/products/services/subscribers.service";
import {UpdateWorkerDto} from "../../src/products/dto/update-worker.dto";
import {v4 as uuid} from 'uuid';
import {UpdateEntity} from "../../src/products/entity/update.entity";
import {StreamEntity} from "../../src/products/entity/stream.entity";
import {GrantType} from "../../src/products/dto/grant.model";

const id = uuid();
const stream_id = uuid();

const update = {
  id,
  stream_id,
  payload: "mockPayload",
  marker: {
    started: true,
    stopped: false,
    frequency: '15m'
  },
  stream: null,
  uploaded_at: new Date(),
  recorded_at: new Date(),
} as UpdateEntity;

const streamWithoutLive = {
  id: "c0e7d770-aabd-4192-98c7-7538b49415a6",
  owner_id: "f920366e-3ec3-4230-8042-7d38b8281f68",
  keypair_id: "28c01711-b5cb-4ebb-8f7e-1a00c97e08c5",
  device_id: "9716688f-fb04-4d2e-8475-3aea07fa9015",
  type: "test213233113",
  created_at: "2022-05-12T14:09:25.280Z",
  updated_at: "2022-05-12T14:09:25.280Z",
  grants: [{
    id: "c0e7d770-aabd-4192-98c7-7538b49415a7",
    type: GrantType.range,
    recipient_id: "c0e7d770-aabd-4192-98c7-7538b49415a8",
    owner_id: "c0e7d770-aabd-4192-98c7-7538b4941510",
    properties: {
      e2eKey: 'e2ekey',
      reEncryptionKey: 'reEncryptionKey'
    }
  }]
} as StreamEntity;

const streamWithAllGrant = {
  ...streamWithoutLive,
  grants: [...streamWithoutLive.grants, {
    id: "c0e7d770-aabd-4192-98c7-7538b49415a7",
    type: GrantType.all,
    recipient_id: "c0e7d770-aabd-4192-98c7-7538b49415a8",
    owner_id: "c0e7d770-aabd-4192-98c7-7538b4941510",
    properties: {
      e2eKey: 'e2ekey',
      reEncryptionKey: 'reEncryptionKey'
    }
  }]
};

const streamWithLatestGrant = {
  ...streamWithoutLive,
  grants: [...streamWithoutLive.grants, {
    id: "c0e7d770-aabd-4192-98c7-7538b49415a7",
    type: GrantType.latest,
    recipient_id: "c0e7d770-aabd-4192-98c7-7538b49415a8",
    owner_id: "c0e7d770-aabd-4192-98c7-7538b4941510",
    properties: {
      e2eKey: 'e2ekey',
      reEncryptionKey: 'reEncryptionKey'
    }
  }]
};

describe('SubscribersService', () => {
  let service: SubscribersService;
  let streamRepo;
  let publisher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscribersService,
        {
          provide: getRepositoryToken(StreamRepository),
          useFactory: jest.fn(() => ({
            findOne: jest.fn(() => null),
          })),
        },
        {
          provide: StatusPublisher,
          useValue: {
            publishStatusUpdate: jest.fn((update: UpdateWorkerDto) => {})
          }
        }
      ],
    }).compile();

    service = await module.get<SubscribersService>(SubscribersService);
    streamRepo = await module.get<StreamRepository>(StreamRepository);
    publisher = await module.get<StatusPublisher>(StatusPublisher);
  });

  it('should be defined', () => {
    expect(service).to.be.true;
  });

  describe('pushToWorker method', () => {
    it('pushToWorker should return when stream unknown', async () => {
        // Prepare
        streamRepo.findOne = sinon.spy(() => null);
        publisher.publishStatusUpdate = sinon.spy(() => null);

        // Act
        await service.pushToWorker(update);

        // Check
        expect(streamRepo.findOne.calledOnce).to.be.true;
        expect(publisher.publishStatusUpdate.calledOnce).to.be.false;
    });

    it('pushToWorker should not publish if no latest/all grant available', async () => {
      // Prepare
      streamRepo.findOne = sinon.spy(() => streamWithoutLive);
      publisher.publishStatusUpdate = sinon.spy(() => null);

      // Act
      await service.pushToWorker(update);

      // Check
      expect(streamRepo.findOne.calledOnce).to.be.true;
      expect(publisher.publishStatusUpdate.calledOnce).to.be.false;
    });

    it('pushToWorker should publish if all grant available', async () => {
      // Prepare
      streamRepo.findOne = sinon.spy(() => streamWithAllGrant);
      publisher.publishStatusUpdate = sinon.spy(async () => null);
      const grants = streamWithAllGrant.grants.filter(el => el.type === GrantType.all);
      const {id, recorded_at, payload, stream_id} = update;
      const {id: grant_id, owner_id: user_id, recipient_id, properties} = grants[0];

      // Act
      await service.pushToWorker(update);

      // Check
      expect(streamRepo.findOne.calledOnce).to.be.true;
      expect(publisher.publishStatusUpdate.calledOnce).to.be.false;
      expect(publisher.publishStatusUpdate.args[0][0]).to.deep.equal({
        id, recorded_at: recorded_at.toISOString(), payload,
        grant_id, user_id, recipient_id, stream_id,
        reEncryptionKey: properties.reEncryptionKey
      });
    });

    it('pushToWorker should publish if latest grant available', async () => {
      // Prepare
      streamRepo.findOne = sinon.spy(() => streamWithLatestGrant);
      publisher.publishStatusUpdate = sinon.spy(async () => null);
      const grants = streamWithLatestGrant.grants.filter(el => el.type === GrantType.latest);
      const {id, recorded_at, payload, stream_id} = update;
      const {id: grant_id, owner_id: user_id, recipient_id, properties} = grants[0];

      // Act
      await service.pushToWorker(update);

      // Check
      expect(streamRepo.findOne.calledOnce).to.be.true;
      expect(publisher.publishStatusUpdate.calledOnce).to.be.false;
      expect(publisher.publishStatusUpdate.args[0][0]).to.deep.equal({
        id, recorded_at: recorded_at.toISOString(), payload,
        grant_id, user_id, recipient_id, stream_id,
        reEncryptionKey: properties.reEncryptionKey
      });
    });
  })
});