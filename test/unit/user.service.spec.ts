import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../src/products/services/user.service';
import { UserRepository } from '../../src/products/repositories/user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserDto } from '../../src/products/dto/user.model';
import { v4 as uuid } from 'uuid';
import { UserEntity } from '../../src/products/entity/user.entity';
import { UserPublisher } from '../../src/products/rabbit/user.publisher';
import { StatusEntity } from 'src/products/entity/status.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let userList = [];
  let userStatuses = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserPublisher,
          useValue: {
            publishUserUpdate: jest.fn(updated => {})
          }
        },
        {
          provide: getRepositoryToken(UserRepository),
          useFactory: () => ({
            saveUser: jest.fn(user => {
              userList.push(user);
              return user?.id;
            }),
            getUsers: jest.fn(() => userList),
            getUserById: jest.fn(id => userList.find(id)),
            getUserStatuses: jest.fn(id => userStatuses),
            deleteUser: jest.fn(
              id => (userList = userList.filter(user => user.id !== id))
            )
          })
        }
      ]
    }).compile();
    service = await module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(UserRepository));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('insertUser method should return id of inserted user', async () => {
    const id = uuid();
    const userDto = {
      id
    } as UserDto;

    const response = await service.insertUser(userDto);
    expect(response).toEqual(id);
  });

  it('getAllUsers method should return all users', async () => {
    const userId = uuid();
    const users = [{ id: userId } as UserEntity];

    userRepository.getUsers = jest.fn(() => Promise.resolve(users));

    const response = await service.getAllUsers();

    expect(response).toEqual(users);
  });

  it('getUserById method should return user by id', async () => {
    const userId = uuid();
    const user = { id: userId } as UserEntity;

    userRepository.getUserById = jest.fn(() => Promise.resolve(user));

    const response = await service.getUserById(userId);

    expect(response).toEqual(user);
  });

  it('getUserStatuses method should return all user statuses', async () => {
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
    ] as StatusEntity[];

    userRepository.getUserStatuses = jest.fn(() =>
      Promise.resolve(userStatuses)
    );

    const response = await service.getUserStatuses(userId);

    expect(response).toEqual(userStatuses);
  });

  it('deleteUser method should return user by id', async () => {
    const userId = uuid();

    await service.deleteUser(userId);

    expect(userRepository.deleteUser).toBeCalledWith(userId);
  });
});
