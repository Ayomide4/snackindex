import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

/*
 * TODO:
 * - return daily metrics with snack names, date, article/reddit count, article/reddit urls?, search metrics, news/reddit sentiment, stock info
 *
 */
