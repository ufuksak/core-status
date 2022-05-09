import { Test } from '@nestjs/testing';
import {v4 as uuid} from 'uuid';
import * as sinon from 'sinon'
import {expect} from './setup'
import { GrantService } from '../../src/products/services/grant.service';
import { GrantRepository } from '../../src/products/repositories/grant.repository';
import { GrantDto } from '../../src/products/dto/grant.model';
import { TokenData } from '@globalid/nest-auth';
import { StreamService } from '../../src/products/services/stream.service';
import { BadRequestException } from '@nestjs/common';

describe('Grant Service', () => {
    let grantService: GrantService;
    let streamService;
    let grantRepository;

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

    describe('save', () => {
      it('should create grant', async () => {
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
          owner_id: tokenData.client_id,
          streamType: {
            supported_grants: [grantDto.type],
          },
        };

        grantRepository.saveGrant = sinon.spy(() => ({ id: grantId }));
        streamService.getById = sinon.spy(() => streamEntity);

        const response = await grantService.save(tokenData, grantDto);

        expect(response).equal(grantId);

        expect(streamService.getById.calledOnce).to.be.true;
        expect(streamService.getById.args[0][0]).equal(streamId);

        expect(grantRepository.saveGrant.calledOnce).to.be.true;
        expect(grantRepository.saveGrant.args[0][0]).to.deep.equal({
          ...grantDto,
          owner_id: tokenData.client_id,
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
});
