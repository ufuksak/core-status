import {Test, TestingModule} from '@nestjs/testing';
import {UserService} from '../../src/products/services/user.service';
import {UserRepository} from "../../src/products/repositories/user.repository";
import {getRepositoryToken} from "@nestjs/typeorm";
import {UserDto} from "../../src/products/dto/user.model";
import {v4 as uuid} from 'uuid';
import {UserEntity} from '../../src/products/entity/user.entity';
import {UserPublisher} from "../../src/products/rabbit/user.publisher";

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;
  let userList = [];
  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserPublisher,
          useValue: {
            publishUserUpdate: jest.fn((updated) => {})
          }
        },
        {
          provide: getRepositoryToken(UserRepository),
          useFactory: () => ({
            saveUser: jest.fn(user => {
              userList.push(user);
              return user?.id
            }),
            getUsers: jest.fn(() => userList),
            getUserById: jest.fn((id) => userList.find(id)),
            deleteUser: jest.fn((id) => userList = userList.filter(user => user.id !== id)),
          }),
        }
      ],
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

  it('deleteUser method should return user by id', async () => {
    const userId = uuid();

    await service.deleteUser(userId);

    expect(userRepository.deleteUser).toBeCalledWith(userId);
  });
});
