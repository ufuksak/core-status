﻿import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from '@nestjs/config';

export const ormOptions = (configService: ConfigService): TypeOrmModuleOptions =>  ({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  entities: [__dirname + '/../entity/*.entity{.ts,.js}'],
  subscribers: [__dirname + '/../*.subscriber{.ts,.js}'],
  synchronize: false,
  migrations: ['migrations/*.ts'],
  cli: {
    migrationsDir: 'migrations'
  },
});

export default ormOptions;
