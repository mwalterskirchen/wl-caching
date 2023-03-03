import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CachingService } from '../caching.service';

@Injectable()
export class TaskSchedulerService {
  private readonly logger = new Logger(TaskSchedulerService.name);

  constructor(private readonly cachingService: CachingService) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  handleCron() {
    this.cachingService.getRemoteData();
  }
}
