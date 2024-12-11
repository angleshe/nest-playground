import { StaticImplements } from '@nestjs/internal/type';
import { BaseProviderParser } from './base-provider-parser';
import { Provider, ProviderKey, ProviderParserCls, UseFactoryProvider } from './type';
import { ParseProviderManager } from './parse-provider-manager';

class UseFactoryProviderParser
  extends BaseProviderParser<UseFactoryProvider>
  implements
    StaticImplements<ProviderParserCls<UseFactoryProvider>, typeof UseFactoryProviderParser>
{
  static verifyProvider(provider: Provider): provider is UseFactoryProvider {
    return !!(provider as UseFactoryProvider).useFactory;
  }

  override getProviderKey(): ProviderKey {
    return this.provider.provide;
  }

  override getProviderValue() {
    const params = this.getFactoryParams();
    return this.provider.useFactory(...params);
  }

  private getFactoryParams(): unknown[] {
    return (
      this.provider.inject?.map(
        (item) => this.classBuilder.getDependenceByToken(item as ProviderKey) ?? item,
      ) ?? []
    );
  }
}

ParseProviderManager.registerProviderParser(UseFactoryProviderParser);
