import {Test} from '@nestjs/testing';
import {v4 as uuid} from 'uuid';
import * as sinon from 'sinon'
import {expect} from './setup'
import {GrantService} from '../../src/products/services/grant.service';
import {GrantRepository} from '../../src/products/repositories/grant.repository';
import {GrantDto, GrantType, ModifyGrantRangeDto} from '../../src/products/dto/grant.model';
import {TokenData} from '@globalid/nest-auth';
import {StreamService} from '../../src/products/services/stream.service';
import {BadRequestException} from '@nestjs/common';
import {GrantEntity} from 'src/products/entity/grant.entity';
import {
  GrantInvalidTokenScopeException,
  GrantNotFoundException,
  GrantOperationNotAllowed,
  SingletonGrantExists
} from "../../src/products/exception/response.exception";
import {FindOneOptions} from 'typeorm';
import {Scopes} from "../../src/products/util/util";
import {SubscribersService} from "../../src/products/services/subscribers.service";

const validScopesToken = {
  sub: uuid(),
  scopes: [
    Scopes.status_grants_create_live,
    Scopes.status_grants_create_historical,
    Scopes.status_grants_manage
  ]
} as TokenData;

const invalidScopesToken = {
  sub: uuid(),
  scopes: []
} as TokenData;

describe('Grant Service', () => {
    let grantService: GrantService;
    let streamService;
    let grantRepository;
    let queryBuilder: any;
    let subscribersService;

    beforeAll(async () => {
      grantRepository = {};
      streamService = {};
      subscribersService = {};

      const module = await Test.createTestingModule({
          controllers: [],
          providers: [
            GrantService,
            {
              provide: GrantRepository,
              useValue: grantRepository
            },
            {
              provide: StreamService,
              useValue: streamService
            },
            {
              provide: SubscribersService,
              useValue: subscribersService
            }
          ],
      }).compile();

      grantService = module.get<GrantService>(GrantService);
    });

    beforeEach(() => {
      queryBuilder = ({
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockReturnThis(),
        execute: jest.fn().mockReturnThis(),
      })
    })

    describe('save', () => {
      it('should create grant', async () => {
        const streamId = uuid();
        const grantId = uuid();

        const grantDto = {
          "stream_id": streamId,
          "recipient_id": uuid(),
          "properties": {},
          "fromDate": "2020-01-01T00:00:00.000Z",
          "toDate": "2020-01-01T00:00:00.000Z",
          "type": "range",
        } as GrantDto;

        const streamEntity = {
          owner_id: validScopesToken.sub,
          streamType: {
            supported_grants: [grantDto.type],
          },
        };

        grantRepository.saveGrant = sinon.spy(() => ({ id: grantId }));
        streamService.getById = sinon.spy(() => streamEntity);

        const response = await grantService.save(validScopesToken.sub, grantDto, validScopesToken.scopes);

        expect(response.id).to.equal(grantId);

        expect(streamService.getById.calledOnce).to.be.true;
        expect(streamService.getById.args[0][0]).equal(streamId);

        expect(grantRepository.saveGrant.calledOnce).to.be.true;
        expect(grantRepository.saveGrant.args[0][0]).to.deep.equal({
          ...grantDto,
          owner_id: validScopesToken.sub,
        });
      });

      it('should not create all/latest grant twice', async () => {
        const singletonGrants = [
          {type: GrantType.latest},
          {type: GrantType.all}
        ];

        for(const el of singletonGrants) {
          const {type} = el;
          const streamId = uuid();
          const grantId = uuid();

          const grantDto = {
            "stream_id": streamId,
            "recipient_id": uuid(),
            "properties": {},
            "fromDate": "2020-01-01T00:00:00.000Z",
            "toDate": "2020-01-01T00:00:00.000Z",
            type
          } as GrantDto;

          const streamEntity = {
            owner_id: validScopesToken.sub,
            streamType: {
              supported_grants: Object.values(GrantType),
            },
          };

          grantRepository.find = sinon.spy(() => []);
          grantRepository.saveGrant = sinon.spy(() => ({ id: grantId }));
          grantRepository.save = sinon.spy(() => ({ id: grantId }));
          streamService.getById = sinon.spy(() => streamEntity);

          const response = await grantService.save(validScopesToken.sub, grantDto, validScopesToken.scopes);

          expect(response.id).to.equal(grantId);

          expect(streamService.getById.calledOnce).to.be.true;
          expect(streamService.getById.args[0][0]).equal(streamId);

          expect(grantRepository.saveGrant.calledOnce).to.be.true;
          expect(grantRepository.saveGrant.args[0][0]).to.deep.equal({
            ...grantDto,
            owner_id: validScopesToken.sub,
          });

          grantRepository.find = sinon.spy(() => [grantDto]);
          await expect(grantService.save(validScopesToken.sub, grantDto, validScopesToken.scopes))
            .to.be.rejectedWith(SingletonGrantExists);
        }
      });

      it('should not create grant without needed scope', async () => {
        const singletonGrants = [
          {type: GrantType.latest},
          {type: GrantType.range},
          {type: GrantType.all}
        ];

        for(const el of singletonGrants) {
          const {type} = el;
          const streamId = uuid();
          const grantId = uuid();

          const grantDto = {
            "stream_id": streamId,
            "recipient_id": uuid(),
            "properties": {},
            "fromDate": "2020-01-01T00:00:00.000Z",
            "toDate": "2020-01-01T00:00:00.000Z",
            type
          } as GrantDto;

          const streamEntity = {
            owner_id: invalidScopesToken.sub,
            streamType: {
              supported_grants: Object.values(GrantType),
            },
          };

          grantRepository.find = sinon.spy(() => []);
          grantRepository.saveGrant = sinon.spy(() => ({ id: grantId }));
          grantRepository.save = sinon.spy(() => ({ id: grantId }));
          streamService.getById = sinon.spy(() => streamEntity);

          await expect(grantService.save(invalidScopesToken.sub, grantDto, invalidScopesToken.scopes))
            .to.be.rejectedWith(GrantInvalidTokenScopeException);
        }
      });

      it('should throw error if there is no stream', async () => {
        const streamId = uuid();
        const grantId = uuid();

        const grantDto = {
          "stream_id": streamId,
          "recipient_id": uuid(),
          "properties": {},
          "fromDate": "2020-01-01T00:00:00.000Z",
          "toDate": "2020-01-01T00:00:00.000Z",
          "type": "range",
        } as GrantDto;

        grantRepository.saveGrant = sinon.spy(() => ({ id: grantId }));
        streamService.getById = sinon.spy(() => null);

        await expect(grantService.save(
          validScopesToken.sub, grantDto, validScopesToken.scopes))
          .to.be.rejectedWith(BadRequestException);

        expect(streamService.getById.calledOnce).to.be.true;
        expect(streamService.getById.args[0][0]).equal(streamId);

        expect(grantRepository.saveGrant.notCalled).to.be.true;
      });

      it('should throw error if owner id is not match', async () => {
        const streamId = uuid();
        const grantId = uuid();

        const grantDto = {
          "stream_id": streamId,
          "recipient_id": uuid(),
          "properties": {},
          "fromDate": "2020-01-01T00:00:00.000Z",
          "toDate": "2020-01-01T00:00:00.000Z",
          "type": "range",
        } as GrantDto;

        const streamEntity = {
          owner_id: uuid(),
          type: {
            supported_grants: [grantDto.type],
          },
        };

        grantRepository.saveGrant = sinon.spy(() => ({ id: grantId }));
        streamService.getById = sinon.spy(() => streamEntity);

        await expect(grantService.save(validScopesToken.sub, grantDto, validScopesToken.scopes))
          .to.be.rejectedWith(BadRequestException);

        expect(streamService.getById.calledOnce).to.be.true;
        expect(streamService.getById.args[0][0]).equal(streamId);

        expect(grantRepository.saveGrant.notCalled).to.be.true;
      });

      it('should throw error if grant type is not supported by streamType', async () => {
        const streamId = uuid();
        const grantId = uuid();

        const grantDto = {
          "stream_id": streamId,
          "recipient_id": uuid(),
          "properties": {},
          "fromDate": "2020-01-01T00:00:00.000Z",
          "toDate": "2020-01-01T00:00:00.000Z",
          "type": "range",
        } as GrantDto;

        const streamEntity = {
          owner_id: uuid(),
          type: {
            supported_grants: ['latest'],
          },
        };

        grantRepository.saveGrant = sinon.spy(() => ({ id: grantId }));
        streamService.getById = sinon.spy(() => streamEntity);

        await expect(grantService.save(validScopesToken.sub, grantDto, validScopesToken.scopes))
          .to.be.rejectedWith(BadRequestException);

        expect(streamService.getById.calledOnce).to.be.true;
        expect(streamService.getById.args[0][0]).equal(streamId);

        expect(grantRepository.saveGrant.notCalled).to.be.true;
      });
    });

    describe('should get grant', () => {
      it('should get grant', async () => {
        // Prepare
        const stream_id = uuid();
        const id = uuid();
        const owner_id = uuid();
        const grantEntity = {
          id,
          stream_id,
          owner_id,
          "recipient_id": uuid(),
          "properties": {},
          "fromDate": "2020-01-01T00:00:00.000Z",
          "toDate": "2020-01-01T00:00:00.000Z",
          "type": "range",
        } as GrantEntity;

        // Act
        grantRepository.findOne = sinon.spy(() => grantEntity);
        const response = await grantService.get(grantEntity.id, grantEntity.owner_id);

        // Check
        expect(response.id).to.equal(id);
        expect(grantRepository.findOne.calledOnce).to.be.true;
        expect(grantRepository.findOne.args[0][0]).to.deep.equal(id);
        expect(grantRepository.findOne.args[0][1]).to.deep.equal({where: {owner_id}});
      });

      it("should response 'grant not found' GrantNotFoundException", async () => {
        // Prepare
        const id = uuid();
        const owner_id = uuid();
        grantRepository.findOne = sinon.spy(() => null);

        // Act & Check
        await expect(grantService.get(id, owner_id))
          .to.be.rejectedWith(GrantNotFoundException);

        expect(grantRepository.findOne.calledOnce).to.be.true;
        expect(grantRepository.findOne.args[0][0]).to.deep.equal(id);
        expect(grantRepository.findOne.args[0][1]).to.deep.equal({where: {owner_id}});
      });
    });

    describe('should delete grant', () => {
      it('should delete grant', async () => {
        // Prepare
        const stream_id = uuid();
        const id = uuid();
        const owner_id = uuid();
        const grantEntity = {
          id,
          stream_id,
          owner_id,
          "recipient_id": uuid(),
          "properties": {},
          "fromDate": "2020-01-01T00:00:00.000Z",
          "toDate": "2020-01-01T00:00:00.000Z",
          "type": "range",
        } as GrantEntity;

        queryBuilder.execute = sinon.spy(() => ({raw: [grantEntity]}));
        grantRepository.createQueryBuilder = sinon.spy(() => queryBuilder);
        grantRepository.findOne = sinon.spy((id: string, options: FindOneOptions<GrantEntity>) => grantEntity);
        grantRepository.save = sinon.spy((entity: GrantEntity) => {});
        subscribersService.removeFromChannelGroup = sinon.spy(() => {});

        // Act
        const response = await grantService.delete(grantEntity.id, grantEntity.owner_id);

        // Check
        expect(response.id).to.equal(id);
        expect(grantRepository.createQueryBuilder.calledOnce).to.be.true;
        expect(queryBuilder.execute.calledOnce).to.be.true;
        expect(response.id).to.equal(id);
      });

      it('should response error for non existing grant', async () => {
        // Prepare
        const stream_id = uuid();
        const id = uuid();
        const owner_id = uuid();
        const grantEntity = {
          id,
          stream_id,
          owner_id,
          "recipient_id": uuid(),
          "properties": {},
          "fromDate": "2020-01-01T00:00:00.000Z",
          "toDate": "2020-01-01T00:00:00.000Z",
          "type": "range",
        } as GrantEntity;

        queryBuilder.execute = sinon.spy(() => ({raw: []}));
        grantRepository.createQueryBuilder = sinon.spy(() => queryBuilder);

        // Act & Check
        await expect(grantService.delete(grantEntity.id, grantEntity.owner_id))
          .to.be.rejectedWith(GrantNotFoundException);
        expect(grantRepository.createQueryBuilder.calledOnce).to.be.true;
        expect(queryBuilder.execute.calledOnce).to.be.true;
      });
    });

  describe('should modify/not modify grant date range', () => {
    it('should modify ranged grant', async () => {
      // Prepare
      const stream_id = uuid();
      const id = uuid();
      const owner_id = uuid();
      const grantEntity = {
        id,
        stream_id,
        owner_id,
        "recipient_id": uuid(),
        "properties": {},
        "fromDate": "2020-01-01T00:00:00.000Z",
        "toDate": "2020-01-01T00:00:00.000Z",
        "type": "range",
      } as GrantEntity;

      const fromDate = new Date("2020-01-01T00:00:00.000Z").toISOString();
      const toDate = new Date("2020-01-01T00:00:00.000Z").toISOString();
      const rangeToApply: ModifyGrantRangeDto = { fromDate, toDate };
      grantRepository.findOne = sinon.spy((id: string, options: FindOneOptions<GrantEntity>) => grantEntity);
      grantRepository.save = sinon.spy((entity: GrantEntity) => {});

      // Act
      const response = await grantService.modifyRange(grantEntity.id, grantEntity.owner_id, rangeToApply);

      // Check
      expect(grantRepository.findOne.calledOnce).to.be.true;
      expect(grantRepository.save.calledOnce).to.be.true;
      expect(response).to.deep.equal({...grantEntity, ...rangeToApply});
    });

    it('should throw error on range change for latest/all', async () => {
      // Prepare
      const stream_id = uuid();
      const id = uuid();
      const owner_id = uuid();
      const grantEntity = {
        id,
        stream_id,
        owner_id,
        recipient_id: uuid(),
        properties: {},
        fromDate: "2020-01-01T00:00:00.000Z",
        toDate: "2020-01-01T00:00:00.000Z",
        type: "latest",
      } as GrantEntity;

      const fromDate = new Date("2020-01-01T00:00:00.000Z").toISOString();
      const toDate = new Date("2020-01-01T00:00:00.000Z").toISOString();
      const rangeToApply: ModifyGrantRangeDto = { fromDate, toDate };
      grantRepository.findOne = sinon.spy((id: string, options: FindOneOptions<GrantEntity>) => grantEntity);
      grantRepository.save = sinon.spy((entity: GrantEntity) => {});

      // Act & Check
      await expect(grantService.modifyRange(grantEntity.id, grantEntity.owner_id, rangeToApply))
        .to.be.rejectedWith(GrantOperationNotAllowed);
      expect(grantRepository.findOne.calledOnce).to.be.true;

      grantEntity.type = GrantType.all;
      await expect(grantService.modifyRange(grantEntity.id, grantEntity.owner_id, rangeToApply))
        .to.be.rejectedWith(GrantOperationNotAllowed);
      expect(grantRepository.findOne.calledOnce).to.be.true;
    });
  });
});
