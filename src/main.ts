import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use((req, res, next) => {
    req.user = {
      name: 'angle',
      id: 10,
    };
    return next();
  });

  await app.listen(3000);
}

bootstrap();
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        name: string;
        id: number;
      };
    }
  }
}
