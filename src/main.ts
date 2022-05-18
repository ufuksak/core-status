import {NestFactory} from '@nestjs/core';
import {ConfigService} from "@nestjs/config";
import {AppModule} from './app.module';
import {JsonApiTransformer} from "./products/commons/transformer/jsonapi.transformer";
import {JsonApiExceptionTransformer} from "./products/commons/transformer/jsonapi-exception.transformer";
import {ValidationPipe} from "@nestjs/common";
import {S3ConfigProvider} from "./products/config/s3.config.provider";
import {useContainer} from 'class-validator';
import {validationPipeOptions} from "./products/config/validation-pipe.options";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
    app.useGlobalFilters(new JsonApiExceptionTransformer());
    app.useGlobalInterceptors(new JsonApiTransformer());
    await new S3ConfigProvider().createBucket();
    const configService = app.get(ConfigService);
    await app.listen(configService.get('CORE_STATUS_PORT'));
}

bootstrap();
