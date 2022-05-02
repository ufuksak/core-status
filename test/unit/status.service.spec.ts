import {Test, TestingModule} from '@nestjs/testing';
import {StatusService} from '../../src/products/services/status.service';
import {StatusRepository} from "../../src/products/repositories/status.repository";
import {getRepositoryToken} from "@nestjs/typeorm";
import {v4 as uuid} from 'uuid';
import {StatusPublisher} from "../../src/products/rabbit/status.publisher";
import {StreamRepository} from "../../src/products/repositories/stream.repository";
import {StreamTypeService} from "../../src/products/services/stream_type.service";
import {StreamTypeRepository} from "../../src/products/repositories/stream_type.repository";


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

  beforeEach(async () => {

    queryBuilder = ({
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      orIgnore: jest.fn().mockReturnThis(),
      execute: jest.fn().mockReturnThis(),
    })

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatusService,
        StreamTypeService,
        {
          provide: getRepositoryToken(StatusRepository),
          useFactory: jest.fn(() => ({
            createQueryBuilder: jest.fn(() => queryBuilder),
          })),
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
        payload: "mockPayload"
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

});