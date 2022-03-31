import {INestApplication} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Test, TestingModule} from "@nestjs/testing";
import {ProductsModule} from "../../src/products/modules/products.module";
import {Repository} from "typeorm";
import {ProductEntity} from "../../src/products/entity/product.entity";
import * as supertest from "supertest";

describe('UserController (e2e)', () => {
    let userRepository: Repository<ProductEntity>;
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ProductsModule,
                TypeOrmModule.forRoot({
                    type: 'sqlite',
                    database: ':memory:',
                    entities: [ProductEntity],
                    logging: true,
                    synchronize: true,
                }),
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        userRepository = moduleFixture.get('ProductRepository');
    });

    afterAll(async () => {
        await app.close();
    });

    afterEach(async () => {
        await userRepository.query('DELETE FROM product');
    });

    describe('GET /api/v1/products', () => {
        it('should return an array of users', async () => {
            // Pre-populate the DB with some dummy users
            await userRepository.save([
                {
                    title: "test3",
                    description: "desc3",
                    price: 150,
                    unit: "television"
                },
                {
                    title: "test4",
                    description: "desc4",
                    price: 150,
                    unit: "phone"
                }
            ]);

            // Run your end-to-end test
            const {body} = await supertest.agent(app.getHttpServer())
                .get('/api/v1/products')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(body).toEqual([
                {id: expect.any(String), title: 'test3', description: "desc3", price: 150, unit: "television"},
                {id: expect.any(String), title: 'test4', description: "desc4", price: 150, unit: "phone"}
            ]);
        });
    });
});
