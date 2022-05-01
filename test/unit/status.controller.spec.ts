import {Test} from '@nestjs/testing';
import { StatusController } from '../../src/products/controllers/status.controller';
import { StreamService } from '../../src/products/services/stream.service';
import { StreamRepository } from '../../src/products/repositories/stream.repository';
import {v4 as uuid} from 'uuid';
import { StreamTypeService } from '../../src/products/services/stream_type.service';
import { StreamTypeDto } from 'src/products/dto/stream_type.model';
import {expect} from './setup';
import * as sinon from 'sinon';

describe('Status Controller', () => {
    let statusController: StatusController;
    let streamService;
    let streamTypeService;

    beforeAll(async () => {
      streamService = {};
      streamTypeService = {};

      const module = await Test.createTestingModule({
          controllers: [StatusController],
          providers: [
            StreamRepository,
            {
              provide: StreamService,
              useValue: streamService
            },
            {
              provide: StreamTypeService,
              useValue: streamTypeService
            }
          ],
      }).compile();

      statusController = module.get<StatusController>(StatusController);
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

            expect(response).equal(streamId);
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

        const response = await statusController.createStreamType(streamType);

        expect(response).to.have.property('id', streamTypeId);

        expect(streamTypeService.save.calledOnce).to.be.true;
        expect(streamTypeService.save.args[0][0]).to.deep.equal(streamType);
      });
    });

    describe('deleteStreamType', () => {
      it('should delete streamType', async () => {
        const streamTypeId = uuid();
        streamTypeService.delete = sinon.spy(async () => ({ affected: 1 }));

        const response = await statusController.deleteStreamType(streamTypeId);

        expect(response).to.have.property('affected', 1);

        expect(streamTypeService.delete.calledOnce).to.be.true;
        expect(streamTypeService.delete.args[0][0]).equal(streamTypeId);
      });
    });
});
