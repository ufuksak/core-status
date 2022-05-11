import {Test} from '@nestjs/testing';
import {v4 as uuid} from 'uuid';
import * as sinon from 'sinon'
import {expect} from './setup'
import {GrantService} from '../../src/products/services/grant.service';
import {GrantRepository} from '../../src/products/repositories/grant.repository';
import {GrantDto} from '../../src/products/dto/grant.model';
import {TokenData} from '@globalid/nest-auth';
import {StreamService} from '../../src/products/services/stream.service';
import {BadRequestException} from '@nestjs/common';
import {GrantEntity} from 'src/products/entity/grant.entity';
import {GrantNotFoundException} from "../../src/products/exception/response.exception";

describe('Grant Service', () => {
    let grantService: GrantService;
    let streamService;
    let grantRepository;
    let queryBuilder: any;

    beforeAll(async () => {
      grantRepository = {};
      streamService = {};

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

        const tokenData = {
          sub: uuid(),
        } as TokenData;

        const grantDto = {
          "stream_id": streamId,
          "recipient_id": uuid(),
          "properties": {},
          "fromDate": "2020-01-01T00:00:00.000Z",
          "toDate": "2020-01-01T00:00:00.000Z",
          "type": "range",
        } as GrantDto;

        const streamEntity = {
          owner_id: tokenData.sub,
          streamType: {
            supported_grants: [grantDto.type],
          },
        };

        grantRepository.saveGrant = sinon.spy(() => ({ id: grantId }));
        streamService.getById = sinon.spy(() => streamEntity);

        const response = await grantService.save(tokenData, grantDto);

        expect(response.id).to.equal(grantId);

        expect(streamService.getById.calledOnce).to.be.true;
        expect(streamService.getById.args[0][0]).equal(streamId);

        expect(grantRepository.saveGrant.calledOnce).to.be.true;
        expect(grantRepository.saveGrant.args[0][0]).to.deep.equal({
          ...grantDto,
          owner_id: tokenData.sub,
        });
      });

      it('should throw error if there is no stream', async () => {
        const streamId = uuid();
        const grantId = uuid();

        const tokenData = {
          client_id: uuid(),
        } as TokenData;

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

        await expect(grantService.save(tokenData, grantDto)).to.be.rejectedWith(BadRequestException);

        expect(streamService.getById.calledOnce).to.be.true;
        expect(streamService.getById.args[0][0]).equal(streamId);

        expect(grantRepository.saveGrant.notCalled).to.be.true;
      });

      it('should throw error if owner id is not match', async () => {
        const streamId = uuid();
        const grantId = uuid();

        const tokenData = {
          client_id: uuid(),
        } as TokenData;

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

        await expect(grantService.save(tokenData, grantDto)).to.be.rejectedWith(BadRequestException);

        expect(streamService.getById.calledOnce).to.be.true;
        expect(streamService.getById.args[0][0]).equal(streamId);

        expect(grantRepository.saveGrant.notCalled).to.be.true;
      });

      it('should throw error if grant type is not supported by streamType', async () => {
        const streamId = uuid();
        const grantId = uuid();

        const tokenData = {
          client_id: uuid(),
        } as TokenData;

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

        await expect(grantService.save(tokenData, grantDto)).to.be.rejectedWith(BadRequestException);

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

        // Act
        const response = await grantService.delete(grantEntity.id, grantEntity.owner_id);

        // Check
        expect(response.id).to.equal(id);
        expect(grantRepository.createQueryBuilder.calledOnce).to.be.true;
        expect(queryBuilder.execute.calledOnce).to.be.true;
        expect(response.id).to.equal(id);
      });

      it("should response GrantNotFoundException", async () => {
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
});
