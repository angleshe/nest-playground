import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger.service';

export interface Cat {
  name: string;
  age: number;
  breed: string;
}

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];
  private logger: LoggerService;

  constructor(logger: LoggerService) {
    console.log('asd', logger);
    this.logger = logger;
  }

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    this.logger.log('findAll======>');
    return this.cats;
  }
}
