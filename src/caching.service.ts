import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Collection, MongoClient, WithId } from 'mongodb';
import { ApiResponse } from './types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CachingService extends MongoClient implements OnModuleInit {
  private readonly logger = new Logger(CachingService.name);
  private collection: Collection;
  constructor(private readonly configService: ConfigService) {
    super(configService.get<string>('DB_URL'));
  }
  async onModuleInit() {
    await this.connect();
    this.logger.debug('Connected successfully to server');
    this.collection = this.db('wl-caching').collection('departures');
    // set TTL to 60 seconds
    await this.collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 120 },
    );
  }
  async getRemoteData() {
    const response = await fetch(
      `https://www.wienerlinien.at/ogd_realtime/monitor?${this.configService.get<string>(
        'PARAMS',
      )}`,
    );
    const data = await response.json();
    this.logger.debug('Got data from remote');
    await this.save(data);
  }
  async save(data: any) {
    // save data to cache
    await this.collection.insertOne({ ...data, createdAt: new Date() });
    this.logger.debug('Saved data to cache');
  }

  async getLocalData() {
    // get data from cache
    const data = await this.collection.findOne<WithId<ApiResponse>>(
      {},
      { sort: { createdAt: -1 } },
    );
    this.logger.debug('Got data from cache');
    return data;
  }

  async getDepartures({
    line,
    direction,
  }: {
    line?: string;
    direction?: string;
  }) {
    if (!line && !direction) {
      throw new BadRequestException({
        error: "Line and direction can't be empty",
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const data = await this.getLocalData();
    return this.filterDepartures({ data, line, direction });
  }

  async filterDepartures({
    data,
    line,
    direction,
  }: {
    data: WithId<ApiResponse>;
    line: string;
    direction: string;
  }) {
    //filter by line and direction and return departures countdown
    return data.data.monitors
      .filter((monitor) => {
        return (
          monitor.lines.some((l) => l.name === line) &&
          monitor.lines.some((l) => l.direction === direction)
        );
      })
      .map((monitor) => {
        return {
          name: monitor.lines[0].name,
          direction: monitor.lines[0].direction,
          towards: monitor.lines[0].towards,
          createdAt: data.createdAt,
          departures: monitor.lines[0].departures.departure.map((departure) => {
            return {
              departureIn: departure.departureTime.countdown,
            };
          }),
        };
      });
  }
}
