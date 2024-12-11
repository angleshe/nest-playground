import { Module } from '@nestjs/common';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { CommonModule } from './common.module';
import { LoggerService } from './logger.service';

@Module({
  controllers: [CatsController],
  providers: [
    CatsService,
    {
      provide: LoggerService,
      useClass: LoggerService,
    },
  ],
  imports: [
    CommonModule.register({
      a: 1,
      b: 2,
    }),
  ],
})
export class CatsModule {}
