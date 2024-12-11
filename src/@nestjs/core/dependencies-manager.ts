import {
  getMetadata,
  getParamTypeMeta,
  type InjectKey,
  ParseProviderManager,
  type ClassBuilder,
  type ClassConstructor,
  type IParseProviderManager,
  type Provider,
  type ProviderKey,
  type ProviderValue,
  INJECT_KEYS,
} from '../internal';

export interface IDependenciesManager extends ClassBuilder {
  registerProvider(...providers: Provider[]): void;
  registerGlobalProvider(...providers: Provider[]): void;
}

export class DependenciesManager<T = unknown> implements IDependenciesManager {
  private static readonly instanceMap = new Map<unknown, DependenciesManager>();

  private static readonly dependenciesInstanceMap = new Map<ProviderKey, ProviderValue>();

  private static readonly globalDependencies = new Set<ProviderKey>();

  static getInstance<T>(id: T) {
    if (!this.instanceMap.has(id)) {
      this.instanceMap.set(id, new this<T>(id));
    }
    return this.instanceMap.get(id)!;
  }

  private readonly parseProviderManager: IParseProviderManager = new ParseProviderManager(this);

  private readonly id: T;

  private readonly dependencies = new Set<ProviderKey>();

  private constructor(id: T) {
    this.id = id;
  }

  registerGlobalProvider(...providers: Provider[]): void {
    providers.forEach((provider) => {
      this.addProvider(provider, true);
    });
  }

  registerProvider(...providers: Provider[]): void {
    providers.forEach((provider) => {
      this.addProvider(provider);
    });
  }

  buildClass<T extends object>(Cls: ClassConstructor<T>): T {
    const dependenciesTokens = this.getDependenciesTokensByClass(Cls);
    const params = this.getParamsByDependenciesTokens(dependenciesTokens);
    return new Cls(...params);
  }

  getDependenceByToken(token: ProviderKey) {
    return this.isExistProviderKey(token)
      ? DependenciesManager.dependenciesInstanceMap.get(token)
      : undefined;
  }

  private addProvider(provider: Provider, isGlobal: boolean = false) {
    const providerParser = this.parseProviderManager.getProviderParser(provider);
    if (!providerParser) {
      throw new Error(`not found Parser by \n ${provider}`);
    }
    const key = providerParser.getProviderKey();
    if (!DependenciesManager.dependenciesInstanceMap.has(key)) {
      const instance = providerParser.getProviderValue();
      DependenciesManager.dependenciesInstanceMap.set(key, instance);
    }

    if (isGlobal) {
      DependenciesManager.globalDependencies.add(key);
    } else {
      this.dependencies.add(key);
    }
  }

  private isExistProviderKey(token: ProviderKey): boolean {
    return this.dependencies.has(token) || DependenciesManager.globalDependencies.has(token);
  }

  private getDependenciesTokensByClass(Cls: ClassConstructor): ProviderKey[] {
    const injectKeys = getMetadata<InjectKey[]>(INJECT_KEYS, Cls) ?? [];
    const paramTypes = getParamTypeMeta<ProviderKey>(Cls) ?? [];

    return paramTypes.map((paramType, i) => {
      const injectKey = injectKeys.find(({ index }) => index === i);
      if (injectKey) {
        return injectKey.key;
      }
      return paramType;
    });
  }

  private getParamsByDependenciesTokens(tokens: ProviderKey[]): unknown[] {
    return tokens.map((token) => this.getDependenceByToken(token));
  }
}
