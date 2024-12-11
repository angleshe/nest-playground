import { BaseProviderParser } from './base-provider-parser';
import type { ClassProvider, ProviderKey, ProviderParserCls } from './type';
import type { StaticImplements } from '../../type';
import { ParseProviderManager } from './parse-provider-manager';

class ClassProviderParser
  extends BaseProviderParser<ClassProvider>
  implements StaticImplements<ProviderParserCls<ClassProvider>, typeof ClassProviderParser>
{
  override getProviderKey(): ProviderKey {
    return this.provider;
  }
  override getProviderValue() {
    return this.classBuilder.buildClass(this.provider);
  }
}

ParseProviderManager.registerProviderParser(ClassProviderParser);
