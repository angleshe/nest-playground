import {
  type ClassConstructor,
  getMetadata,
  IMPORT_MODULES,
  safeGetMetadata,
  type ImportModule,
  type ModuleCls,
  type DynamicModule,
  type Provider,
  CONTROLLER,
  PROVIDERS,
  EXPORTS,
  IS_GLOBAL,
  isModuleClass,
  IServer,
  NestModule,
  MiddlewareConsumer,
  ClassBuilder,
} from '../internal';
import { Controller, IController } from './controller';
import { DependenciesManager, type IDependenciesManager } from './dependencies-manager';
import { MiddlewareManager } from './middleware-manager';
export interface IModule {
  getControllers(): IController[];
  init(): Promise<void>;
  getClassBuilder(): ClassBuilder;
  registerGlobalProvider(...providers: Provider[]): void;
}

export class Module implements IModule {
  readonly moduleCls: ModuleCls;

  protected readonly importModules: Module[] = [];

  protected readonly dependenciesManager: IDependenciesManager;

  protected readonly middlewareManager: MiddlewareConsumer;

  private readonly app: IServer;

  static async create(app: IServer, moduleCls: ModuleCls): Promise<Module> {
    const instance = new this(app, moduleCls);
    await instance.init();
    return instance;
  }

  constructor(app: IServer, moduleCls: ModuleCls) {
    this.moduleCls = moduleCls;
    this.app = app;
    this.dependenciesManager = DependenciesManager.getInstance<ModuleCls>(moduleCls);
    this.middlewareManager = new MiddlewareManager(app, this.dependenciesManager);
  }
  registerGlobalProvider(...providers: Provider[]): void {
    this.dependenciesManager.registerGlobalProvider(...providers);
  }
  getClassBuilder(): ClassBuilder {
    return this.dependenciesManager;
  }

  private get isGlobal() {
    return getMetadata<boolean>(IS_GLOBAL, this.moduleCls) ?? false;
  }

  async init() {
    await this.initImportModuleCls();
    this.registerProvider();
    this.initModuleConfigure();
  }

  private initModuleConfigure() {
    (this.moduleCls.prototype as NestModule)?.configure?.(this.middlewareManager);
  }

  private isPromiseDynamicModule(val: ImportModule): val is Promise<DynamicModule> {
    return val instanceof Promise;
  }

  private isDynamicModule(val: ImportModule): val is DynamicModule {
    return Reflect.has(val, 'module');
  }

  private async initImportModuleCls() {
    const importModulesClsArr = getMetadata<ImportModule[]>(IMPORT_MODULES, this.moduleCls) ?? [];

    const modules = await Promise.all(
      importModulesClsArr.map<Promise<Module>>(async (importModules) => {
        let moduleCls: ModuleCls;
        if (this.isPromiseDynamicModule(importModules)) {
          importModules = await importModules;
        }
        if (this.isDynamicModule(importModules)) {
          const target = importModules.module;
          const controllers = safeGetMetadata<ClassConstructor[]>(CONTROLLER, [], target);
          const providers = safeGetMetadata<Provider[]>(PROVIDERS, [], target);
          const imports = safeGetMetadata<ImportModule[]>(IMPORT_MODULES, [], target);
          const exports = safeGetMetadata<(ModuleCls | Provider)[]>(EXPORTS, [], target);
          controllers.push(...(importModules.controllers ?? []));
          providers.push(...(importModules.providers ?? []));
          imports.push(...(importModules.imports ?? []));
          exports.push(...(importModules.exports ?? []));
          moduleCls = target;
        } else {
          moduleCls = importModules;
        }
        return Module.create(this.app, moduleCls);
      }),
    );

    this.importModules.push(...modules);
  }

  private registerProvider() {
    const providers = this.getProviders();
    if (this.isGlobal) {
      this.dependenciesManager.registerGlobalProvider(...providers);
    } else {
      this.dependenciesManager.registerProvider(...providers);
    }
  }

  getControllers(): IController[] {
    const importControllers = this.getImportModuleControllers();
    const ownControllers = this.getOwnModuleControllers();
    return [...importControllers, ...ownControllers];
  }

  private getImportModuleControllers(): IController[] {
    return this.importModules.reduce<IController[]>(
      (res, module) => res.concat(module.getControllers()),
      [],
    );
  }

  private getOwnModuleControllers(): IController[] {
    const ownControllerCls = getMetadata<ClassConstructor[]>(CONTROLLER, this.moduleCls) ?? [];
    return ownControllerCls.map((cls) => new Controller(cls, this));
  }

  private getProviders(): Provider[] {
    const importProviders = this.getImportProviders();
    const ownProviders = this.getOwnProviders();
    return [...importProviders, ...ownProviders];
  }

  private getImportProviders(): Provider[] {
    return this.importModules.reduce<Provider[]>(
      (exports, module) => exports.concat(module.getExportProviders()),
      [],
    );
  }

  private getOwnProviders(): Provider[] {
    return getMetadata<Provider[]>(PROVIDERS, this.moduleCls) ?? [];
  }

  getExportProviders(): Provider[] {
    const exportData = getMetadata<(ModuleCls | Provider)[]>(EXPORTS, this.moduleCls) ?? [];
    return exportData.reduce<Provider[]>((providers, item) => {
      if (isModuleClass(item)) {
        const module = this.importModules.find(({ moduleCls }) => moduleCls === item);
        providers.push(...(module?.getExportProviders() ?? []));
      } else {
        providers.push(item);
      }
      return providers;
    }, []);
  }
}
