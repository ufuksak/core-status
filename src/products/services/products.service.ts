import {Injectable} from "@nestjs/common";
import {ProductDto} from "../dto/product.model";
import {InjectRepository} from "@nestjs/typeorm";
import {ProductRepository} from "../repositories/product.repository";
import {ProductsPublisher} from "../rabbit/products.publisher";

@Injectable()
export class ProductsService {

    constructor(
        @InjectRepository(ProductRepository) private readonly productRepo: ProductRepository,
        private readonly productsPublisher: ProductsPublisher
    ) {}

    insertProduct = async (product: ProductDto) => {
        await this.productRepo.saveProduct(product);
        await this.productsPublisher.publishProductUpdate(product);
        return product.id;
    }

    getAllProducts = async () => {
        return await this.productRepo.getProducts();
    }

    getProductById = async (id: string) => {
        return await this.productRepo.getProductById(id);
    }

    deleteProduct = async (id: string) => {
        return await this.productRepo.deleteProduct(id);
    }
}
