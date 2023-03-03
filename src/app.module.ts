import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskSchedulerService } from './task-scheduler/task-scheduler.service';
import { CachingService } from './caching.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import type { LoggerModuleAsyncParams } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

const severity = (label: string) => {
  switch (label) {
    case 'trace':
      return 'DEBUG';
    case 'debug':
      return 'DEBUG';
    case 'info':
      return 'INFO';
    case 'warn':
      return 'WARNING';
    case 'error':
      return 'ERROR';
    case 'fatal':
      return 'CRITICAL';
    default:
      return 'DEFAULT';
  }
};

const level = (label: string, level: number) => ({
  severity: severity(label),
  level,
});

export const pinoLoggerConfigOptions: LoggerModuleAsyncParams = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    pinoHttp: {
      formatters: { level },
      transport:
        config.get('NODE_ENV') === 'development'
          ? { target: 'pino-pretty' }
          : { target: 'pino/file' },
      genReqId: () => randomUUID(),
      level: 'debug',
      redact: {
        paths: ['req.headers.cookie', 'res.headers["set-cookie"]'],
      },
      quietReqLogger: true,
    },
  }),
};

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync(pinoLoggerConfigOptions),
  ],
  controllers: [AppController],
  providers: [AppService, TaskSchedulerService, CachingService],
})
export class AppModule {}
