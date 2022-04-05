import {INestApplication} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Test, TestingModule} from "@nestjs/testing";
import {UsersModule} from "../../src/products/modules/users.module";
import {getConnection, Repository} from "typeorm";
import {UserEntity} from "../../src/products/entity/user.entity";
import * as supertest from "supertest";
import config from './ormconfig';
import {truncateEntity} from "./helpers";
import {CountryCodeEntity} from "../../src/products/entity/country_code.entity";
import {DeviceEntity} from "../../src/products/entity/device.entity";
import {GpsEntity} from "../../src/products/entity/gps.entity";
import {NotificationStatusEntity} from "../../src/products/entity/notification_status.entity";
import {RegionEntity} from "../../src/products/entity/region.entity";
import {StatusEntity} from "../../src/products/entity/status.entity";
import {TimezoneEntity} from "../../src/products/entity/tz.entity";
import {UserActionEntity} from "../../src/products/entity/user_action.entity";
import {StatusRepository} from "../../src/products/repositories/status.repository";
import {UserRepository} from "../../src/products/repositories/user.repository";
import {FileEntity} from "../../src/products/entity/file.entity";
import {Container} from "../../src/products/entity/container.entity";
import {Pot} from "../../src/products/entity/pot.entity";
import {DeviceModelEntity} from "../../src/products/entity/device_model.entity";
import {PotModule} from "../../src/products/modules/pot.module";
import {ContainerModule} from "../../src/products/modules/container.module";

describe('UserController (e2e)', () => {
    let testRepository: Repository<UserEntity>;
    let app: INestApplication;

    const data1 = {
        "username": "ufuksakar",
        "pin": "pin",
        "name": "ufuk",
        "surname": "sakar",
        "address_line_1": "test address1",
        "address_line_2": "address2",
        "city": "Istanbul",
        "state_province": "-",
        "postal_code": "34000",
        "country": "Turkey",
        "phone_num": "00905557035175",
        "mobile_num": "00905557035175",
        "fax_num": "-",
        "status": [
            {
                "uuid": "4f05c340-20db-4fef-9d95-b204044a8ff6",
                "type": "Available",
                "recorded_at": "2022-07-21T09:35:31.820Z",
                "uploaded_at": "2022-07-21T09:35:31.820Z",
                "encrypted_payload": "payload"
            }
        ],
        "gpsList": [
            {
                "id": "4f05c340-20db-4fef-9d95-b204044a8ff6",
                "device_id": "1",
                "speed": 50,
                "direction": 50
            }
        ],
        "actionList": [
            {
                "id": "4f05c340-20db-4fef-9d95-b204044a8ff6",
                "name": "userSave",
                "description": "user save"
            }
        ]
    };

    beforeAll(async () => {
        const configWithEntity = {
            ...config, entities: [UserEntity,
                CountryCodeEntity,
                DeviceEntity,
                DeviceModelEntity,
                GpsEntity,
                NotificationStatusEntity,
                RegionEntity,
                StatusEntity,
                TimezoneEntity,
                UserActionEntity,
                UserRepository,
                StatusRepository,
                FileEntity,
                Container,
                Pot]
        };
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                UsersModule,
                PotModule,
                ContainerModule,
                TypeOrmModule.forRoot(configWithEntity),
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
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
            const output1 = {
                "username": "ufuksakar",
                "pin": "pin",
                "name": "ufuk",
                "surname": "sakar",
                "address_line_1": "test address1",
                "address_line_2": "address2",
                "city": "Istanbul",
                "state_province": "-",
                "postal_code": "34000",
                "country": "Turkey",
                "phone_num": "00905557035175",
                "mobile_num": "00905557035175",
                "fax_num": "-",
                "created_at": expect.any(String),
                "updated_at": expect.any(String),
                "available_utc": null,
                "last_connection_utc": null,
                "last_status_utc": null
            };
            await testRepository.save([
                data1
            ]);

            // Run your end-to-end test
            const {body} = await supertest.agent(app.getHttpServer())
                .get('/api/v1/users')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(body).toEqual([
                {...output1, id: expect.any(String)}
            ]);
        });
    });

    async function verifyDeleted(bodyGetResponse, output1) {
        const {body} = await supertest.agent(app.getHttpServer())
            .del('/api/v1/users/' + bodyGetResponse[0].id)
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(body).toEqual(output1);
    }

    describe('DEL /api/v1/users/:id', () => {
        it('should return no users after the deletion', async () => {

            const output1 = {
                "raw": [],
                "affected": 1
            };
            await testRepository.save([
                data1
            ]);

            // Run your end-to-end test
            const {body} = await supertest.agent(app.getHttpServer())
                .get('/api/v1/users')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);

            await verifyDeleted(body, output1);
        });
    });
});
