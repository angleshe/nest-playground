import { Pipe, PIPES, safeGetMetadata } from '../internal';

export function UsePipes(...pipes: Pipe[]): ClassDecorator | MethodDecorator {
  return (target, propertyKey) => {
    const pipesArr = safeGetMetadata<Pipe[]>(PIPES, [], target, propertyKey);
    pipesArr.push(...pipes);
  };
}
