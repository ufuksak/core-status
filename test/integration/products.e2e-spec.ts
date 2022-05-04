import {INestApplication} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {getConnection, Repository} from "typeorm";
import {ProductEntity} from "../../src/products/entity/product.entity";
import * as supertest from "supertest";
import {truncateEntity} from "./helpers";
import {AppProductsTestModule} from "./modules/app.products.test.module";

describe('ProductController (e2e)', () => {
    let testRepository: Repository<ProductEntity>;
    let app: INestApplication;

    beforeAll(async () => {

        const moduleFixture: TestingModule =
          await Test.createTestingModule({
            imports: [AppProductsTestModule]
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
