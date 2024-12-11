import { INJECT_KEYS, type InjectKey, type Provide, safeGetMetadata } from '../internal';

export function Inject(key: Provide): ParameterDecorator {
  return (target, _, index) => {
    const injectKeys = safeGetMetadata<InjectKey[]>(INJECT_KEYS, [], target);
    injectKeys.push({
      index,
      key,
    });
  };
}

export function Injectable(): ClassDecorator {
  return () => {};
}
