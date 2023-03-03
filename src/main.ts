import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

const now = performance.now();
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  const config = app.get(ConfigService);

  app.useLogger(logger);

  await app.listen(8080);

  logger.log(`App running in [${config.get('NODE_ENV')}] mode`);
  logger.log(`Listening at: ${await app.getUrl()}`);
  logger.debug(`App took ${Math.round(performance.now() - now)}ms to start.`);
}
bootstrap();
