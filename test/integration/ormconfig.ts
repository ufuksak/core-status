import {config} from 'dotenv';

import {TypeOrmModuleOptions} from "@nestjs/typeorm";

/**
 * Read environment variables from .env
 */
config();

const ormConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 54320,
    username: 'user_messaging',
    password: 'e5YGE3cQ2ysqHesT',
    database: 'test_messaging',
    synchronize: true,
    dropSchema: true
};

export default ormConfig;
