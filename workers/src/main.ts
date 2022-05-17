import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.WORKER_PORT, () => {
    console.log(`Microservice is listening on port ${process.env.WORKER_PORT}`);
  });
}
bootstrap();
