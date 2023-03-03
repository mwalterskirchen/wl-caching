import { Controller, Get, Query } from '@nestjs/common';
import { CachingService } from './caching.service';

@Controller()
export class AppController {
  constructor(private readonly cachingService: CachingService) {}

  @Get()
  async getDepatures(
    @Query('line') line?: string,
    @Query('direction') direction?: string,
  ): Promise<any> {
    return this.cachingService.getDepartures({ line, direction });
  }
}
