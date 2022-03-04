import {EntityRepository, Repository} from "typeorm";
import {ProductEntity} from "../entity/product.entity";
import {ProductDto} from "../dto/product.model";

@EntityRepository(ProductEntity)
export class ProductRepository extends Repository<ProductEntity> {

    saveProduct = async (productDto: ProductDto) => {
        await this.save(productDto);
    }

    getProducts = async () => {
        return await this.find();
    }

    getProductById = async (id: string) => {
        return await this.findOneOrFail(id);
    }

    deleteProduct = async (id: string) => {
        return await this.delete(id);
    }
}
