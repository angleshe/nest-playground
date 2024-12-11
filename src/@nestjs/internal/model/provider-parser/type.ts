import type { ClassConstructor, ModuleCls, Provide } from '../../type';
export type ClassProvider = ClassConstructor;

export type ProviderObj = {
  provide: Provide;
};

export type UseValueProvider = {
  useValue: unknown;
} & ProviderObj;

export type UseClassProvider = ProviderObj & {
  useClass: ClassConstructor;
};

export type UseFactoryProvider = ProviderObj & {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  useFactory: Function;
  inject?: unknown[];
};

export type Provider = ClassProvider | UseValueProvider | UseClassProvider | UseFactoryProvider;

export type ProviderKey = Provide | ClassConstructor;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ProviderValue = any;

export interface IBaseProviderParser {
  getProviderKey(): ProviderKey;
  getProviderValue(): ProviderValue;
}

export interface IParseProviderManager {
  getProviderParser(provider: Provider): IBaseProviderParser | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ProviderParserCls<T extends Provider = any> {
  new (provider: T, classBuilder: ClassBuilder): IBaseProviderParser;
  verifyProvider?: (provider: Provider) => provider is T;
}

export interface ClassBuilder {
  buildClass<T extends object = object>(Cls: ClassConstructor<T>): T;
  getDependenceByToken(token: ProviderKey): ProviderValue | undefined;
}

export type ImportModule = ModuleCls | DynamicModule | Promise<DynamicModule>;

export interface ModuleOptions {
  controllers?: ClassConstructor[];
  providers?: Provider[];
  imports?: ImportModule[];
  exports?: (ModuleCls | Provider)[];
}

export interface DynamicModule extends ModuleOptions {
  module: ModuleCls;
}
