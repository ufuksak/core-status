import {ValidationPipe} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {AppUpdateTestModule} from "../../modules/app.update.test.module";
import {JsonApiExceptionTransformer} from "../../../../src/products/commons/transformer/jsonapi-exception.transformer";
import {JsonApiTransformer} from "../../../../src/products/commons/transformer/jsonapi.transformer";
import {useContainer} from "class-validator";
import {v4 as uuid} from 'uuid';
import {validationPipeOptions} from "../../../../src/products/config/validation-pipe.options";
import supertest = require("supertest");
import {addListener as transportInit} from "../../../../src/products/pubnub/pubnub";
import {Transport} from "../../../../src/products/pubnub/interfaces";

export default async function setup(){
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppUpdateTestModule]
  }).compile();

  const transportConf: Transport.Config = {
    subscribeKey: 'sub-c-b791aa8d-6d5d-4f39-8de1-d81bc4dfe39e',
    publishKey: 'pub-c-2c1361ef-be16-4581-89aa-6be9df0c9910',
    logVerbosity: false,
    uuid: uuid(),
  }

  const app = moduleFixture.createNestApplication();
  useContainer(app.select(AppUpdateTestModule), {fallbackOnErrors: true});
  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
  app.useGlobalFilters(new JsonApiExceptionTransformer());
  app.useGlobalInterceptors(new JsonApiTransformer());

  const server = await app.getHttpServer();
  const agent = await supertest.agent(server);

  transportInit(transportConf);
  await app.init();

  return {
    app,
    agent,
    server
  }
}