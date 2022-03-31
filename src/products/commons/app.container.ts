import {INestApplication} from '@nestjs/common';
import {ProductsService} from "../services/products.service";
import {UserService} from "../services/user.service";
import {PotService} from "../services/pot.service";

/**
 * AppContainer is a global container to store instance of services from Application Context
 */
export const AppContainer = {
    container: {},

    /**
     * call this from application bootstrap() method in the main server file
     * then all services instance will available globally, they will be stored inside this `modules` key
     */
    initContainer: (app: INestApplication) => {
        AppContainer.container['UserService'] = app.get<ProductsService>(UserService);
        AppContainer.container['PotService'] = app.get<ProductsService>(PotService);
    },

    /**
     * get service instance by their serviceToken/ name
     */
    getService: (serviceToken: string) => {
        return AppContainer.container.hasOwnProperty(serviceToken) ? AppContainer.container[serviceToken] : null;
    }
}
