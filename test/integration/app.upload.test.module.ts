import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {UploadImageModule} from '../../src/products/modules/uploadimage.module';
import config from '../../ormconfig';
import {UsersModule} from "../../src/products/modules/users.module";

@Module({
    imports: [
        UploadImageModule,
        UsersModule,
        TypeOrmModule.forRoot(config)
    ],
    controllers: [],
    providers: [],
})
export class AppUploadTestModule {}
