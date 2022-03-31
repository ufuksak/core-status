import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {JsonApiTransformer} from "./products/commons/transformer/jsonapi.transformer";
import {JsonApiExceptionTransformer} from "./products/commons/transformer/jsonapi-exception.transformer";
import {ValidationPipe} from "@nestjs/common";
import { AppContainer } from './products/commons/app.container';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    AppContainer.initContainer(app);
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new JsonApiExceptionTransformer());
    app.useGlobalInterceptors(new JsonApiTransformer());
    await app.listen(3000);
}

bootstrap();
