import type { ModuleOptions, DynamicModule } from '../internal';
import {
  CONTROLLER,
  defineMetadata,
  EXPORTS,
  IMPORT_MODULES,
  IS_GLOBAL,
  IS_MODULE,
  PROVIDERS,
} from '../internal';

export type { DynamicModule };

export function Module(options: ModuleOptions): ClassDecorator {
  return (target) => {
    defineMetadata<true>(IS_MODULE, true, target);
    defineMetadata(CONTROLLER, options.controllers ?? [], target);
    defineMetadata(PROVIDERS, options.providers ?? [], target);
    defineMetadata(IMPORT_MODULES, options.imports ?? [], target);
    defineMetadata(EXPORTS, options.exports ?? [], target);
  };
}

export function Global(): ClassDecorator {
  return (target) => {
    defineMetadata<true>(IS_GLOBAL, true, target);
  };
}
