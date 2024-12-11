import type {
  Provider,
  ClassBuilder,
  ProviderKey,
  ProviderValue,
  IBaseProviderParser,
} from './type';

export abstract class BaseProviderParser<T extends Provider = Provider>
  implements IBaseProviderParser
{
  protected readonly provider: T;

  protected readonly classBuilder: ClassBuilder;

  constructor(provider: T, classBuilder: ClassBuilder) {
    this.provider = provider;
    this.classBuilder = classBuilder;
  }

  abstract getProviderKey(): ProviderKey;
  abstract getProviderValue(): ProviderValue;
}
