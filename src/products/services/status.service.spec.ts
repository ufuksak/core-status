import { Test, TestingModule } from '@nestjs/testing';
import { StatusService } from './status.service';
import { StatusRepository } from "../repositories/status.repository";
import { getRepositoryToken } from "@nestjs/typeorm";
import { v4 as uuid } from 'uuid';

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