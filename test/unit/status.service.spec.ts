import {Test, TestingModule} from '@nestjs/testing';
import {StatusService} from '../../src/products/services/status.service';
import {StatusRepository} from "../../src/products/repositories/status.repository";
import {getRepositoryToken} from "@nestjs/typeorm";
import {v4 as uuid} from 'uuid';
import {StatusPublisher} from "../../src/products/rabbit/status.publisher";

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
        {
          provide: getRepositoryToken(StatusRepository),
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

  describe('save method', () => {
    it('should save status', async () => {
      const userId = uuid();
      const status = [{ id: uuid() } as any];

      queryBuilder.execute = jest.fn(() => ({
        generatedMaps:[{
          uploaded_at: new Date(),
        }]
      }));

      const response = await service.save(userId, status);

      expect(response[0].gid_uuid).toEqual(userId);
    });
  })

});