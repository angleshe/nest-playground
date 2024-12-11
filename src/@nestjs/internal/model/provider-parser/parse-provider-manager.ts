import type {
  ClassBuilder,
  IBaseProviderParser,
  IParseProviderManager,
  Provider,
  ProviderParserCls,
} from './type';

export class ParseProviderManager implements IParseProviderManager {
  private static readonly providerParseClassArr: ProviderParserCls[] = [];
  private static defaultProviderParseClass: ProviderParserCls | null;

  static registerProviderParser<T extends Provider>(providerParserCls: ProviderParserCls<T>): void {
    if (providerParserCls.verifyProvider) {
      this.providerParseClassArr.push(providerParserCls);
    } else if (!this.defaultProviderParseClass) {
      this.defaultProviderParseClass = providerParserCls;
    } else {
      throw new Error('providerParserCls not has verifyProvider methods');
    }
  }

  private readonly classBuilder: ClassBuilder;

  constructor(classBuilder: ClassBuilder) {
    this.classBuilder = classBuilder;
  }

  getProviderParser(provider: Provider): IBaseProviderParser | undefined {
    const Cls =
      ParseProviderManager.providerParseClassArr.find((parser) =>
        parser.verifyProvider?.(provider),
      ) ?? ParseProviderManager.defaultProviderParseClass;
    if (!Cls) {
      return undefined;
    }

    return new Cls(provider, this.classBuilder);
  }
}
