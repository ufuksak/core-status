import {Module} from "@nestjs/common";
import {ProductsController} from "../controllers/products.controller";
import {ProductsService} from "../services/products.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ProductEntity} from "../entity/product.entity";
import {ProductRepository} from "../repositories/product.repository";
import {ProductsPublisher} from "../rabbit/products.publisher";

@Module({
    imports:[TypeOrmModule.forFeature([ProductEntity, ProductRepository])],
    controllers:[ProductsController],
    providers:[ProductsService, ProductsPublisher]
})
export class ProductsModule{}
