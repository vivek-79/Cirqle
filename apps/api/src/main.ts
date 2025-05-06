import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  app.use(cookieParser());
  app.enableCors({
    origin: ["http://localhost:3000"],
    credentials: true
  })

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
