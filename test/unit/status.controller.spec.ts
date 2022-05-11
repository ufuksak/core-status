import {Test} from '@nestjs/testing';
import {StatusController} from '../../src/products/controllers/status.controller';
import {StreamService} from '../../src/products/services/stream.service';
import {StreamRepository} from '../../src/products/repositories/stream.repository';
import {v4 as uuid} from 'uuid';
import {StreamTypeService} from '../../src/products/services/stream_type.service';
import {StreamTypeDto} from '../../src/products/dto/stream_type.model';
import {expect} from './setup';
import * as sinon from 'sinon';
import {TokenData, TokenModule} from '@globalid/nest-auth';
import {CreateStreamRequestBody} from "../../src/products/dto/stream.model";
import {StatusService} from "../../src/products/services/status.service";
import {StatusRepository} from "../../src/products/repositories/status.repository";
import {StreamTypeRepository} from "../../src/products/repositories/stream_type.repository";
import {StatusPublisher} from "../../src/products/rabbit/status.publisher";
import {KeystoreService} from "../../src/products/services/keystore";
import {ConfigModule} from '@nestjs/config';
import {CONFIG_VALIDATION_SCHEMA, configuration} from "../../src/products/config/config";
import {GrantService} from '../../src/products/services/grant.service';
import {GrantDto} from '../../src/products/dto/grant.model';

describe('Status Controller', () => {
  let statusController: StatusController;
  let streamService;
  let statusService;
  let grantService;
  let streamTypeService;

  beforeAll(async () => {
    streamService = {};
    statusService = {};
    grantService = {};
    streamTypeService = {};

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
        {
          provide: StreamService,
          useValue: streamService
        },
        {
          provide: StatusService,
          useValue: statusService
        },
        {
          provide: GrantService,
          useValue: grantService
        },
        {
          provide: StreamTypeService,
          useValue: streamTypeService
        },
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

    statusController = module.get<StatusController>(StatusController);
  });

  describe('createStream', () => {
    it('should create stream', async () => {
      const streamId = uuid();
      streamService.create = jest.fn(async () => streamId);

      const req = {
        headers: {
          authorization: 'Bearer token',
        }
      }
      const body = {
        stream_type: 'streamType',
        encrypted_private_key: 'test',
        public_key: 'test',
      } as CreateStreamRequestBody;

      const tokenData = {
        client_id: uuid(),
      } as TokenData;

      const response = await statusController.createStream(req, tokenData, body);

      expect(response).equal(streamId);
    });
  });

  describe('createGrant', () => {
    it('should create grant', async () => {
      const streamId = uuid();
      grantService.save = jest.fn(async () =>streamId);

      const body = {
        "stream_id": streamId,
        "recipient_id": uuid(),
        "properties": {},
        "fromDate": "2020-01-01T00:00:00.000Z",
        "toDate": "2020-01-01T00:00:00.000Z",
        "type": "range",
      } as GrantDto;

      const tokenData = {
        client_id: uuid(),
      } as TokenData;

      const response = await statusController.createGrant(tokenData, body);

      expect(response).equal(streamId);
    });
  });

  describe('getGrant', () => {
    it('should get grant', async () => {
      const streamId = uuid();
      const id = uuid();
      const body = {
        id,
        "stream_id": streamId,
        "recipient_id": uuid(),
        "properties": {},
        "fromDate": "2020-01-01T00:00:00.000Z",
        "toDate": "2020-01-01T00:00:00.000Z",
        "type": "range",
      };

      grantService.get = jest.fn(async () => body);

      const tokenData = {
        client_id: uuid(),
      } as TokenData;

      const response = await statusController.getGrant(tokenData, {id});

      expect(response).equal(body);
    });
  });

  describe('deleteGrant', () => {
    it('should delete grant', async () => {
      const streamId = uuid();
      const id = uuid();
      const body = {
        id,
        "stream_id": streamId,
        "recipient_id": uuid(),
        "properties": {},
        "fromDate": "2020-01-01T00:00:00.000Z",
        "toDate": "2020-01-01T00:00:00.000Z",
        "type": "range",
      };

      grantService.delete = jest.fn(async () => body);

      const tokenData = {
        client_id: uuid(),
      } as TokenData;

      const response = await statusController.deleteGrant(tokenData, {id});

      expect(response).equal(body);
    });
  });

  describe('getStreamTypes', () => {
    it('should return all streamTypes', async () => {
      const streamTypeEntity = {
        "id": uuid(),
        "granularity": "single",
        "stream_handling": "lockbox",
        "approximated": true,
      }

      streamTypeService.getAll = sinon.spy(async () => [streamTypeEntity]);

      const response = await statusController.getStreamTypes();

      expect(response).to.deep.equal([streamTypeEntity]);

      expect(streamTypeService.getAll.calledOnce).to.be.true;
      expect(streamTypeService.getAll.args[0]).to.be.empty;
    });
  });

  describe('createStreamType', () => {
    it('should create streamType', async () => {
      const streamTypeId = uuid();
      streamTypeService.save = sinon.spy(async () => ({ id: streamTypeId }));

      const streamType = {
        granularity: 'single',
        stream_handling: 'lockbox',
        approximated: true,
        supported_grants: ['range'],
        type: 'test',
      } as StreamTypeDto;

      const tokenData = {
        client_id: uuid(),
      } as TokenData;
      const response = await statusController.createStreamType(tokenData, streamType);

      expect(response).to.have.property('id', streamTypeId);

      expect(streamTypeService.save.calledOnce).to.be.true;
      expect(streamTypeService.save.args[0][0]).to.deep.equal(streamType);
    });
  });

  describe('deleteStreamType', () => {
    it('should delete streamType', async () => {
      const id = uuid();
      streamTypeService.delete = sinon.spy(async () => ({ affected: 1 }));

      const response = await statusController.deleteStreamType({id});

      expect(response).to.have.property('affected', 1);

      expect(streamTypeService.delete.calledOnce).to.be.true;
      expect(streamTypeService.delete.args[0][0]).equal(id);
    });
  });

});
