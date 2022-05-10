import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from '@nestjs/config';

export const ormOptions = (configService: ConfigService): TypeOrmModuleOptions =>  ({
  type: 'postgres',
  host: configService.get('POSTGRESQL_COMPAT') ? configService.get('POSTGRES_DB_HOST'): configService.get('CRDB_DB_HOST'),
  port: configService.get('POSTGRESQL_COMPAT') ? configService.get('POSTGRES_DB_PORT'): configService.get('CRDB_DB_PORT'),
  username: configService.get('POSTGRESQL_COMPAT') ? configService.get('POSTGRES_DB_USERNAME'): configService.get('CRDB_DB_USERNAME'),
  password: configService.get('POSTGRESQL_COMPAT') ? configService.get('POSTGRES_DB_PASSWORD'): configService.get('CRDB_DB_PASSWORD'),
  database: configService.get('POSTGRESQL_COMPAT') ? configService.get('POSTGRES_DB_DATABASE'): configService.get('CRDB_DB_DATABASE'),
  entities: [__dirname + '/../entity/*.entity{.ts,.js}'],
  subscribers: [__dirname + '/../*.subscriber{.ts,.js}'],
  synchronize: configService.get('POSTGRESQL_COMPAT'),
  migrations: ['migrations/*.ts'],
  cli: {
    migrationsDir: 'migrations'
  },
});

export default ormOptions;
