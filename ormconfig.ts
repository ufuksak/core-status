import { config } from 'dotenv';

import { TypeOrmModuleOptions } from "@nestjs/typeorm";

/**
 * Read environment variables from .env
 */
config();

const ormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  subscribers: [__dirname + '/**/*.subscriber{.ts,.js}'],
  // synchronize: true,
  migrations: ['migrations/*.ts'],
  cli: {
    migrationsDir: 'migrations'
  },
}

export default ormConfig;
