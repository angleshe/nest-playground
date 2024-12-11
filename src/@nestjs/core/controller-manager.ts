import { IServer } from '../internal';
import { IController } from './controller';
import { GlobalFiltersProvider } from './exception-filter-manager';
import { GlobalGuardProvider, GuardManager } from './guard-manager';
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
  private readonly controllers: IController[] = [];

  constructor(
    app: IServer,
    globalFiltersProvider: GlobalFiltersProvider,
    globalPipesProvider: GlobalPipesProvider,
    globalGuardProvider: GlobalGuardProvider,
  ) {
    this.app = app;
    this.globalFiltersProvider = globalFiltersProvider;
    this.globalPipesProvider = globalPipesProvider;
    this.globalGuardProvider = globalGuardProvider;
  }

  addController(...controllers: IController[]): void {
    controllers.forEach((controller) => {
      const pipeManager = new PipeManager(controller, this.globalPipesProvider);
      controller.setPipeManager(pipeManager);
      const guardManager = new GuardManager(controller, this.globalGuardProvider);
      controller.setGuardManager(guardManager);
      this.controllers.push(controller);
    });
  }
  resolveControllers(): void {
    this.controllers.forEach((controller) =>
      controller.resolveControllers(this.app, this.globalFiltersProvider),
    );
  }
}
