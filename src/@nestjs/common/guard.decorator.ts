import { Guard, GUARDS, safeGetMetadata } from '../internal';

export function UseGuards(...guards: Guard[]): ClassDecorator & MethodDecorator {
  return ((target, propertyKey) => {
    const guardsArr = safeGetMetadata<Guard[]>(GUARDS, [], target, propertyKey);
    guardsArr.push(...guards);
  }) as ClassDecorator & MethodDecorator;
}
