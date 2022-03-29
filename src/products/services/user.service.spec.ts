import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from "../repositories/user.repository";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserDto } from "../dto/user.model";
import { v4 as uuid } from 'uuid';
import { UserEntity } from '../entity/user.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: UserRepository;

  beforeEach(async () => {

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserRepository),
          useFactory: () => ({
            saveUser: jest.fn(() => []),
            getUsers: jest.fn(() => []),
            getUserById: jest.fn(() => { }),
            deleteUser: jest.fn(() => { }),
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
    const userId = uuid();
    userRepository.saveUser = jest.fn(async (dto) => dto.id = userId);

    const dto = {} as UserDto;
    const response = await service.insertUser(dto);

    expect(response).toEqual(userId);
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