import { BaseRequestProPertyDecorator } from './base-request-property-decorator';
import { PARAM_KEY } from './type';

export class ParamDecorator extends BaseRequestProPertyDecorator {
  override typeStr: string = 'param';
  protected readonly requestProPertyName = 'params';
  readonly type = PARAM_KEY.PARAM;
  protected override readonly supperGetPropertyByArgs: boolean = true;
  override readonly isSupperPipe: boolean = true;
}
