import { Logger } from './logger';
import { NestApplication } from './nest-application';

export class NestFactory {
  private static readonly logger = new Logger('NestFactory');

  static async create(module: new () => object) {
    this.logger.log('Starting Nest application...');
    return new NestApplication(module);
  }
}
