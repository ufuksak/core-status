import {Test} from '@nestjs/testing';
import {ProductsController} from '../src/products/controllers/products.controller';
import {ProductsService} from '../src/products/services/products.service';
import {ProductEntity} from "../src/products/entity/product.entity";
import {getRepositoryToken} from "@nestjs/typeorm";
import {ProductRepository} from "../src/products/repositories/product.repository";

describe('Products Controller', () => {
    let productController: ProductsController;
    let productService: ProductsService;
    let productRepository: ProductRepository

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [ProductRepository],
            controllers: [ProductsController],
            providers: [
              ProductsService,
              {
                provide: getRepositoryToken(ProductRepository),
                useFactory: () => ({
                  getProducts: jest.fn(() => []),
                }),
              }
            ],
        }).compile();

        productController = module.get<ProductsController>(ProductsController);
        productService = module.get<ProductsService>(ProductsService);
        productRepository = module.get(getRepositoryToken(ProductRepository));
    });

    describe('getAllProducts', () => {
        it('should return all products', async () => {
            const result: ProductEntity[] = [
                {
                    "id": 2,
                    "title": "Masterning NestJS",
                    "description": "official book to learn and master NestJS",
                    "price": 23,
                    "unit": "$"
                }
            ];
            jest.spyOn(productRepository, 'getProducts').mockResolvedValueOnce(result);
            jest.spyOn(productService, 'getAllProducts').mockImplementation(() => Promise.resolve(result));
            expect(await productController.getProducts()).toBe(result);
        });
    });
});
