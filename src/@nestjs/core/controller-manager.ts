import { IServer } from '../internal';
import { IController } from './controller';
import { GlobalFiltersProvider } from './exception-filter-manager';
import { GlobalPipesProvider, PipeManager } from './pipe-manager';

export interface IControllerManager {
  addController(...controllers: IController[]): void;
  resolveControllers(): void;
}

export class ControllerManager implements IControllerManager {
  private readonly app: IServer;
  private readonly globalFiltersProvider: GlobalFiltersProvider;
  private readonly globalPipesProvider: GlobalPipesProvider;
  private readonly controllers: IController[] = [];

  constructor(
    app: IServer,
    globalFiltersProvider: GlobalFiltersProvider,
    globalPipesProvider: GlobalPipesProvider,
  ) {
    this.app = app;
    this.globalFiltersProvider = globalFiltersProvider;
    this.globalPipesProvider = globalPipesProvider;
  }

  addController(...controllers: IController[]): void {
    controllers.forEach((controller) => {
      const pipeManager = new PipeManager(controller, this.globalPipesProvider);
      controller.setPipeManager(pipeManager);
      this.controllers.push(controller);
    });
  }
  resolveControllers(): void {
    this.controllers.forEach((controller) =>
      controller.resolveControllers(this.app, this.globalFiltersProvider),
    );
  }
}
