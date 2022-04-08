import {INestApplication} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Test, TestingModule} from "@nestjs/testing";
import {ProductsModule} from "../../src/products/modules/products.module";
import {getConnection, Repository} from "typeorm";
import {ProductEntity} from "../../src/products/entity/product.entity";
import * as supertest from "supertest";
import config from './ormconfig';
import {truncateEntity} from "./helpers";
import {CONFIG_VALIDATION_SCHEMA, RABBIT_URI} from "../../src/products/config/config";
import {AmqpModule} from "@globalid/nest-amqp";
import {ConfigModule} from "@nestjs/config";
import {ProductRepository} from "../../src/products/repositories/product.repository";

describe('ProductController (e2e)', () => {
    let testRepository: Repository<ProductEntity>;
    let app: INestApplication;

    beforeAll(async () => {
        const configWithEntity = {...config, entities: [ProductEntity, ProductRepository]};
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ProductsModule,
                TypeOrmModule.forRoot(configWithEntity),
                AmqpModule.forConfig({
                    urlOrOpts: RABBIT_URI,
                    defaultValidationOptions: { classTransform: { enableImplicitConversion: true }, validate: true },
                }),
                ConfigModule.forRoot({
                    validationSchema: CONFIG_VALIDATION_SCHEMA,
                    validationOptions: {
                        allowUnknown: true,
                        abortEarly: true,
                    },
                    isGlobal: true
                })
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        testRepository = getConnection().getRepository(ProductEntity);
    });

    beforeEach(async () => {
        await truncateEntity(ProductEntity);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/v1/products', () => {
        it('should return an array of users', async () => {
            const data1 = {
                title: "test3",
                description: "desc3",
                price: 150,
                unit: "television"
            };
            const data2 = {
                title: "test3",
                description: "desc3",
                price: 150,
                unit: "television"
            };
            await testRepository.save([
                data1,
                data2
            ]);

            // Run your end-to-end test
            const {body} = await supertest.agent(app.getHttpServer())
                .get('/api/v1/products')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(body).toEqual([
                {...data1, id: expect.any(String)},
                {...data2, id: expect.any(String)}
            ]);
        });
    });
});
