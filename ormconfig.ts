import { TypeOrmModuleOptions } from "@nestjs/typeorm";

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 26257,
  username: 'root',
  password: 'root',
  database: 'defaultdb',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: ['migrations/*.ts'],
  cli: {
    migrationsDir: 'migrations'
  },
}

export default config;