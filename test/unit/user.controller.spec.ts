import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../src/products/controllers/user.controller';
import { UserService } from '../../src/products/services/user.service';
import { v4 as uuid } from 'uuid';
import { UserDto } from '../../src/products/dto/user.model';
import {
  StatusDto,
  StatusRequestBody,
  StatusResponse,
  StatusResponseBody
} from '../../src/products/dto/status.model';
import { UserEntity } from '../../src/products/entity/user.entity';
import { StatusService } from '../../src/products/services/status.service';
import { UploadService } from '../../src/products/services/upload.service';
import { StatusEntity } from 'src/products/entity/status.entity';

describe('UserController Unit Tests', () => {
  let userController: UserController;
  let userService: UserService;
  let statusService: StatusService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useFactory: () => ({
            insertUser: jest.fn(() => []),
            getAllUsers: jest.fn(() => []),
            getUserById: jest.fn(() => []),
            getUserStatuses: jest.fn(() => []),
            deleteUser: jest.fn(() => []),
            saveStatus: jest.fn(() => [])
          })
        },
        {
          provide: StatusService,
          useFactory: () => ({
            save: jest.fn(() => [])
          })
        },
        {
          provide: UploadService,
          useValue: {}
        }
      ]
    }).compile();

    userController = await module.get<UserController>(UserController);
    userService = await module.get<UserService>(UserService);
    statusService = await module.get<StatusService>(StatusService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  it('addUsers method should return object with id of inserted user', async () => {
    const userId = uuid();
    userService.insertUser = jest.fn(async dto => (dto.id = userId));

    const dto = {} as UserDto;
    const response = await userController.addUsers(dto);

    expect(response).toEqual({ id: userId });
  });

  it('getUserById method should return user by id', async () => {
    const userId = uuid();
    const user = { id: userId } as UserDto;

    userService.getUserById = jest.fn(() =>
      Promise.resolve(user as UserEntity)
    );

    const response = await userController.getUserById(userId);

    expect(response).toEqual({ id: userId });
  });

  it('getUserStatuses method should return user statuses', async () => {
    const userId = uuid();

    const userStatuses = [
      {
        uuid: uuid(),
        type: 'Available',
        recorded_at: '2022-07-21T09:35:31.820Z',
        encrypted_payload: '{"status":"Available"}'
      },
      {
        uuid: uuid(),
        type: 'Not Available',
        recorded_at: '2022-07-22T09:35:31.820Z',
        encrypted_payload: '{"status":"Not Available"}'
      }
    ] as StatusDto[];

    const expectedResponse = [...userStatuses];

    userService.getUserStatuses = jest.fn(
      async () => userStatuses as StatusEntity[]
    );

    const response = await userController.getUserStatuses(userId);

    expect(response).toEqual(expectedResponse);
  });

  it('updateStatus method should update user statuses', async () => {
    const userId = uuid();

    statusService.save = jest.fn(async (id: string, statuses: StatusDto[]) =>
      statuses.map(
        status =>
          ({
            ...status,
            gid_uuid: id
          } as StatusResponse)
      )
    );

    const status = {
      uuid: uuid(),
      type: 'Available',
      recorded_at: '2022-07-21T09:35:31.820Z',
      encrypted_payload: '{"status":"Available"}'
    } as StatusDto;

    const body = { status_updates: [status] } as StatusRequestBody;

    const response = await userController.updateStatus(userId, body);

    const expectedResponse = {
      status_updates: [
        {
          ...status,
          gid_uuid: userId
        }
      ]
    } as StatusResponseBody;

    expect(response).toEqual(expectedResponse);
  });
});
