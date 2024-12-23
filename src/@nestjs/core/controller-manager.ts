import { IServer } from '../internal';
import { IController } from './controller';
import { GlobalFiltersProvider } from './exception-filter-manager';
import { GlobalGuardProvider, GuardManager } from './guard-manager';
import { GlobalInterceptorProvider, InterceptorManager } from './interceptor-manager';
import { GlobalPipesProvider, PipeManager } from './pipe-manager';

export interface IControllerManager {
  addController(...controllers: IController[]): void;
  resolveControllers(): void;
}

export class ControllerManager implements IControllerManager {
  private readonly app: IServer;
  private readonly globalFiltersProvider: GlobalFiltersProvider;
  private readonly globalPipesProvider: GlobalPipesProvider;
  private readonly globalGuardProvider: GlobalGuardProvider;
  private readonly globalInterceptorProvider: GlobalInterceptorProvider;
  private readonly controllers: IController[] = [];

  constructor(
    app: IServer,
    globalFiltersProvider: GlobalFiltersProvider,
    globalPipesProvider: GlobalPipesProvider,
    globalGuardProvider: GlobalGuardProvider,
    globalInterceptorProvider: GlobalInterceptorProvider,
  ) {
    this.app = app;
    this.globalFiltersProvider = globalFiltersProvider;
    this.globalPipesProvider = globalPipesProvider;
    this.globalGuardProvider = globalGuardProvider;
    this.globalInterceptorProvider = globalInterceptorProvider;
  }

  addController(...controllers: IController[]): void {
    controllers.forEach((controller) => {
      const pipeManager = new PipeManager(controller, this.globalPipesProvider);
      controller.setPipeManager(pipeManager);
      const guardManager = new GuardManager(controller, this.globalGuardProvider);
      controller.setGuardManager(guardManager);
      const interceptorManager = new InterceptorManager(controller, this.globalInterceptorProvider);
      controller.setInterceptorManager(interceptorManager);
      this.controllers.push(controller);
    });
  }
  resolveControllers(): void {
    this.controllers.forEach((controller) =>
      controller.resolveControllers(this.app, this.globalFiltersProvider),
    );
  }
}
