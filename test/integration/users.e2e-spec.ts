import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnection, Repository } from 'typeorm';
import { UserEntity } from '../../src/products/entity/user.entity';
import * as supertest from 'supertest';
import { truncateEntity } from './helpers';
import { CountryCodeEntity } from '../../src/products/entity/country_code.entity';
import { DeviceEntity } from '../../src/products/entity/device.entity';
import { GpsEntity } from '../../src/products/entity/gps.entity';
import { NotificationStatusEntity } from '../../src/products/entity/notification_status.entity';
import { RegionEntity } from '../../src/products/entity/region.entity';
import { StatusEntity } from '../../src/products/entity/status.entity';
import { TimezoneEntity } from '../../src/products/entity/tz.entity';
import { UserActionEntity } from '../../src/products/entity/user_action.entity';
import { FileEntity } from '../../src/products/entity/file.entity';
import { Container } from '../../src/products/entity/container.entity';
import { Pot } from '../../src/products/entity/pot.entity';
import { DeviceModelEntity } from '../../src/products/entity/device_model.entity';
import { MessageHandler } from '@globalid/nest-amqp';
import waitForExpect from 'wait-for-expect';
import { UserDto } from '../../src/products/dto/user.model';
import { AppUsersTestModule } from './app.users.test.module';

jest.setTimeout(3 * 60 * 1000);

class Handlers {
  collectedMessages: [] = [];

  getCollectedMessages(): string[] {
    return [...this.collectedMessages];
  }

  clearCollectedMessages(): void {
    this.collectedMessages = [];
  }

  @MessageHandler({})
  async updateAdd(evt: UserDto): Promise<void> {
    this.collectedMessages.push(evt as never);
  }
}

describe('UserController (e2e)', () => {
  let testRepository: Repository<UserEntity>;
  let app: INestApplication;
  let handlers: Handlers = null;

  const statusData = {
    uuid: '4f05c340-20db-4fef-9d95-b204044a8ff6',
    type: 'Available',
    recorded_at: '2022-07-21T09:35:31.820Z',
    uploaded_at: '2022-07-21T09:35:31.820Z',
    encrypted_payload: 'payload'
  };

  const data1 = {
    username: 'ufuksakar',
    pin: 'pin',
    name: 'ufuk',
    surname: 'sakar',
    address_line_1: 'test address1',
    address_line_2: 'address2',
    city: 'Istanbul',
    state_province: '-',
    postal_code: '34000',
    country: 'Turkey',
    phone_num: '00905557035175',
    mobile_num: '00905557035175',
    fax_num: '-',
    status: [{ ...statusData }],
    gpsList: [
      {
        id: '4f05c340-20db-4fef-9d95-b204044a8ff6',
        device_id: '1',
        speed: 50,
        direction: 50
      }
    ],
    actionList: [
      {
        id: '4f05c340-20db-4fef-9d95-b204044a8ff6',
        name: 'userSave',
        description: 'user save'
      }
    ]
  };

  const output1 = {
    username: 'ufuksakar',
    pin: 'pin',
    name: 'ufuk',
    surname: 'sakar',
    address_line_1: 'test address1',
    address_line_2: 'address2',
    city: 'Istanbul',
    state_province: '-',
    postal_code: '34000',
    country: 'Turkey',
    phone_num: '00905557035175',
    mobile_num: '00905557035175',
    fax_num: '-',
    created_at: expect.any(String),
    updated_at: expect.any(String),
    available_utc: null,
    last_connection_utc: null,
    last_status_utc: null
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppUsersTestModule],
      providers: [Handlers]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    handlers = app.get<Handlers>(Handlers);
    testRepository = getConnection().getRepository(UserEntity);
  });

  beforeEach(async () => {
    await truncateEntity(CountryCodeEntity);
    await truncateEntity(DeviceEntity);
    await truncateEntity(DeviceModelEntity);
    await truncateEntity(GpsEntity);
    await truncateEntity(NotificationStatusEntity);
    await truncateEntity(RegionEntity);
    await truncateEntity(StatusEntity);
    await truncateEntity(TimezoneEntity);
    await truncateEntity(UserActionEntity);
    await truncateEntity(FileEntity);
    await truncateEntity(Container);
    await truncateEntity(Pot);
    await truncateEntity(UserEntity);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/users', () => {
    it('should return an array of users', async () => {
      await testRepository.save([data1]);

      // Run your end-to-end test
      const { body } = await supertest
        .agent(app.getHttpServer())
        .get('/api/v1/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(body).toEqual([{ ...output1, id: expect.any(String) }]);
    });
  });

  describe('GET /api/v1/users/:id/statuses', () => {
    it('should return an array of user statuses', async () => {
      await testRepository.save([data1]);

      // Run your end-to-end test
      const { body: userBody } = await supertest
        .agent(app.getHttpServer())
        .get('/api/v1/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      const user = userBody[0] as UserDto;

      const { body: statusesBody } = await supertest
        .agent(app.getHttpServer())
        .get(`/api/v1/users/${user.id}/statuses`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(statusesBody).toEqual([statusData]);
    });
  });

  async function verifyDeleted(bodyGetResponse, output1) {
    const { body } = await supertest
      .agent(app.getHttpServer())
      .del('/api/v1/users/' + bodyGetResponse[0].id)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual(output1);
  }

  describe('DEL /api/v1/users/:id', () => {
    it('should return no users after the deletion', async () => {
      const output1 = {
        raw: [],
        affected: 1
      };
      await testRepository.save([data1]);

      // Run your end-to-end test
      const { body } = await supertest
        .agent(app.getHttpServer())
        .get('/api/v1/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      await verifyDeleted(body, output1);
    });
  });

  describe('POST /api/v1/users', () => {
    it('should verify the user is added', async () => {
      const { body } = await supertest
        .agent(app.getHttpServer())
        .post('/api/v1/users')
        .set('Accept', 'application/json')
        .send(data1)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(body).toEqual({ id: expect.any(String) });

      await waitForExpect(() => {
        expect(handlers.getCollectedMessages()[0]['id']).toEqual(
          expect.any(String)
        );
      });

      handlers.clearCollectedMessages();
    });
  });

  async function verifyGetUserById(bodyGetResponse) {
    const { body } = await supertest
      .agent(app.getHttpServer())
      .get('/api/v1/users/' + bodyGetResponse.id)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual({ ...output1, id: expect.any(String) });
  }

  describe('GET /api/v1/users/:id', () => {
    it('should return a specific user', async () => {
      const { body } = await supertest
        .agent(app.getHttpServer())
        .post('/api/v1/users')
        .set('Accept', 'application/json')
        .send(data1)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(body).toEqual({ id: expect.any(String) });

      await verifyGetUserById(body);
    });
  });

  async function verifyStatusIsUpdatedByUserId(bodyUserResponse) {
    const dataStatus = {
      uuid: '4f05c340-20db-4fef-9d95-b204044a8ff6',
      type: 'Available',
      recorded_at: '2022-07-21T09:35:31.820Z',
      uploaded_at: '2022-07-21T09:35:31.820Z',
      encrypted_payload: 'payload'
    };

    const inputStatus = {
      status_updates: [dataStatus]
    };

    const outputStatusExpected = {
      uuid: expect.any(String),
      gid_uuid: expect.any(String),
      type: 'Available',
      recorded_at: '2022-07-21T09:35:31.820Z',
      encrypted_payload: 'payload'
    };
    const outputStatusExpectedWithId = {
      ...outputStatusExpected,
      user_id: bodyUserResponse.id
    };

    const { body } = await supertest
      .agent(app.getHttpServer())
      .put('/api/v1/users/' + bodyUserResponse.id + '/status')
      .set('Accept', 'application/json')
      .send(inputStatus)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(body).toEqual({ status_updates: [outputStatusExpectedWithId] });
  }

  describe('PUT /api/v1/users/:id/status', () => {
    it('should update the status for the specific user', async () => {
      const { body } = await supertest
        .agent(app.getHttpServer())
        .post('/api/v1/users')
        .set('Accept', 'application/json')
        .send(data1)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(body).toEqual({ id: expect.any(String) });

      await verifyStatusIsUpdatedByUserId(body);
    });
  });
});
