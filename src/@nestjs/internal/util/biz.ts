import { IS_CONTROLLER, IS_MODULE } from '../meta-key';
import { ControllerCls, ModuleCls } from '../type';
import { getMetadata } from './metadata-helper';

export function isControllerClass(cls: object): cls is ControllerCls {
  return getMetadata(IS_CONTROLLER, cls) ?? false;
}

export function isModuleClass(cls: object): cls is ModuleCls {
  return getMetadata(IS_MODULE, cls) ?? false;
}
