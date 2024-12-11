import { StaticImplements } from '../../type';
import { BaseProviderParser } from './base-provider-parser';
import { ParseProviderManager } from './parse-provider-manager';
import { Provider, ProviderKey, ProviderParserCls, UseValueProvider } from './type';

class UseValueProviderParser
  extends BaseProviderParser<UseValueProvider>
  implements StaticImplements<ProviderParserCls, typeof UseValueProviderParser>
{
  override getProviderKey(): ProviderKey {
    return this.provider.provide;
  }
  override getProviderValue() {
    return this.provider.useValue;
  }
  static verifyProvider(provider: Provider): provider is UseValueProvider {
    return !!(provider as UseValueProvider).useValue;
  }
}

ParseProviderManager.registerProviderParser(UseValueProviderParser);
