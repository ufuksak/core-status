import { Test } from '@nestjs/testing';
import { StreamTypeService } from '../../src/products/services/stream_type.service';
import { StreamTypeRepository } from '../../src/products/repositories/stream_type.repository';
import {v4 as uuid} from 'uuid';
import * as sinon from 'sinon'
import { StreamTypeDto } from 'src/products/dto/stream_type.model';
import {expect} from './setup'

describe('Status Type Service', () => {
    let streamTypeService: StreamTypeService;
    let streamTypeRepository;

    beforeAll(async () => {
      streamTypeRepository = {};

      const module = await Test.createTestingModule({
          controllers: [],
          providers: [
            StreamTypeService,
            {
              provide: StreamTypeRepository,
              useValue: streamTypeRepository
            }
          ],
      }).compile();

      streamTypeService = module.get<StreamTypeService>(StreamTypeService);
    });

    describe('save', () => {
      it('should create streamType', async () => {
          const streamTypeId = uuid();

          const streamTypeDto = {
            "granularity": "single",
            "stream_handling": "lockbox",
            "approximated": true,
            "supported_grants": ["range"],
            "type": "test"
          } as StreamTypeDto;

          streamTypeRepository.saveStreamType = sinon.spy(() => ({ id: streamTypeId }));

          const response = await streamTypeService.save(streamTypeDto);

          expect(response).to.have.property('id', streamTypeId);

          expect(streamTypeRepository.saveStreamType.calledOnce).to.be.true;
          expect(streamTypeRepository.saveStreamType.args[0][0]).equal(streamTypeDto);
      });
    });

    describe('getAll', () => {
      it('should return all streamTypes', async () => {

        const streamTypeEntity = {
          "id": uuid(),
          "granularity": "single",
          "stream_handling": "lockbox",
          "approximated": true,
          "supported_grants": ["range"],
          "type": "test"
        } as StreamTypeDto;

        streamTypeRepository.getStreamTypes = sinon.spy(() => [streamTypeEntity]);

        const response = await streamTypeService.getAll();

        expect(response).to.deep.equal([streamTypeEntity]);

        expect(streamTypeRepository.getStreamTypes.calledOnce).to.be.true;
      });
    });


    describe('delete', () => {
      it('should delete streamType', async () => {
        const streamTypeId = uuid();

        streamTypeRepository.deleteStreamType = sinon.spy(() => ({ affected: 1 }));

        const response = await streamTypeService.delete(streamTypeId);

        expect(response).to.have.property('affected', 1);

        expect(streamTypeRepository.deleteStreamType.calledOnce).to.be.true;
        expect(streamTypeRepository.deleteStreamType.args[0][0]).equal(streamTypeId);
      });
    });
});
