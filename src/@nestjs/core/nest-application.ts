import express, { type Express, type RequestHandler } from 'express';
import { Logger } from './logger';
import { type ModuleCls, type ExceptionFilterType, APP_FILTER, Pipe, APP_PIPE } from '../internal';
import session from 'express-session';
import bodyParser from 'body-parser';
import { type IModule, Module } from './module';
import type { GlobalFiltersProvider } from './exception-filter-manager';
import { ControllerManager, IControllerManager } from './controller-manager';
import { GlobalPipesProvider } from './pipe-manager';

export class NestApplication implements GlobalFiltersProvider, GlobalPipesProvider {
  private readonly app: Express;

  private readonly logger = new Logger('NestApplication');

  private readonly controllerManager: IControllerManager;

  private readonly root: IModule;

  private readonly globalFilters: ExceptionFilterType[] = [];

  private readonly globalPipes: Pipe[] = [];

  constructor(module: ModuleCls) {
    this.app = express();
    this.root = new Module(this.app, module);
    this.controllerManager = new ControllerManager(this.app, this, this);
  }
  getGlobalPipes(): Pipe[] {
    const providePipe = this.root.getClassBuilder().getDependenceByToken(APP_PIPE);
    return providePipe ? this.globalPipes.concat([providePipe]) : this.globalPipes;
  }

  getGlobalFilters(): ExceptionFilterType[] {
    const provideFilter = this.root.getClassBuilder().getDependenceByToken(APP_FILTER);
    return provideFilter ? this.globalFilters.concat([provideFilter]) : this.globalFilters;
  }

  useGlobalFilters(...filter: ExceptionFilterType[]): void {
    this.globalFilters.push(...filter);
  }

  useGlobalPipes(...pipes: Pipe[]): void {
    this.globalPipes.push(...pipes);
  }

  use(...plugins: RequestHandler[]): this {
    this.app.use(...plugins);
    return this;
  }

  async listen(prot: number | string) {
    this.logger.log('AppModule dependencies initialized', 'InstanceLoader');
    await this.initModule();
    this.initPlugin();
    this.resolveControllers();
    return this.app.listen(prot, () => {
      this.logger.log('Nest application successfully started');
    });
  }

  private async initModule() {
    await this.root.init();
    const controllers = this.root.getControllers();
    this.controllerManager.addController(...controllers);
  }

  private initPlugin() {
    this.app
      .use(
        session({
          secret: 'keyboard cat',
          cookie: { maxAge: 60000 },
        }),
      )
      .use(bodyParser.json());
  }

  private resolveControllers() {
    this.controllerManager.resolveControllers();
  }
}
