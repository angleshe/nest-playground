import { StaticImplements } from '@nestjs/internal/type';
import { BaseProviderParser } from './base-provider-parser';
import { Provider, ProviderKey, ProviderParserCls, UseClassProvider } from './type';
import { ParseProviderManager } from './parse-provider-manager';

class UseClassProviderParser
  extends BaseProviderParser<UseClassProvider>
  implements StaticImplements<ProviderParserCls<UseClassProvider>, typeof UseClassProviderParser>
{
  static verifyProvider(provider: Provider): provider is UseClassProvider {
    return !!(provider as UseClassProvider).useClass;
  }
  override getProviderKey(): ProviderKey {
    return this.provider.provide;
  }
  override getProviderValue() {
    return this.classBuilder.buildClass(this.provider.useClass);
  }
}

ParseProviderManager.registerProviderParser(UseClassProviderParser);
