import {StreamRepository} from "../../../src/products/repositories/stream.repository";
import {StatusRepository} from "../../../src/products/repositories/status.repository";
import {UploadEntity} from "../../../src/products/entity/upload.entity";
import {UploadRepository} from "../../../src/products/repositories/uploadRepository";
import {StreamTypeRepository} from "../../../src/products/repositories/stream_type.repository";
import {StreamTypeEntity} from "../../../src/products/entity/stream_type.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Module} from "@nestjs/common";
import {CONFIG_VALIDATION_SCHEMA, RABBIT_URI} from "../../../src/products/config/config";
import {AmqpModule, MessageHandler} from "@globalid/nest-amqp";
import {ConfigModule} from "@nestjs/config";
import {TokenModule} from "@globalid/nest-auth";
import {StreamEntity} from "../../../src/products/entity/stream.entity";
import config from "../ormconfig";
import {StatusModule} from "../../../src/products/modules/status.module";
import {UpdateEntity} from "../../../src/products/entity/update.entity";
import {GrantEntity} from "../../../src/products/entity/grant.entity";
import {UpdateWorkerDto} from "../../../src/products/dto/update-worker.dto";

export class Handlers {
  collectedMessages: [] = []

  getCollectedMessages(): any[] {
    return [...this.collectedMessages]
  }

  clearCollectedMessages(): void {
    this.collectedMessages = [];
  }

  @MessageHandler({})
  async updateAdd(evt: UpdateWorkerDto): Promise<void> {
    this.collectedMessages.push(evt as never)
  }
}

@Module({
  imports: [
    StatusModule,
    TokenModule,
    AmqpModule.forConfig({
      urlOrOpts: RABBIT_URI,
      defaultValidationOptions: {classTransform: {enableImplicitConversion: true}, validate: true},
    }),
    ConfigModule.forRoot({
      validationSchema: CONFIG_VALIDATION_SCHEMA,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      ...config,
      entities: [
        StreamRepository,
        StreamEntity,
        StatusRepository,
        UpdateEntity,
        UploadRepository,
        UploadEntity,
        StreamTypeRepository,
        StreamTypeEntity,
        GrantEntity
      ]
    })
  ],
  providers: [
    Handlers
  ]
})
export class AppUpdateTestModule {}