import { APP_FILTER, MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { CatsModule } from './cats.module';
import { LoggerMiddleware } from './logger.middleware';
import { CatsController } from './cats.controller';
import { HttpExceptionFilter } from './http-exception-filter';

@Module({
  controllers: [AppController],
  providers: [
    {
      provide: 'testStr',
      useValue: 'appModule',
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .exclude('cats/value')
      .forRoutes(CatsController)
      .apply((req, res, next) => {
        console.log('gg');
        next();
      })
      .forRoutes('/cats');
  }
}
