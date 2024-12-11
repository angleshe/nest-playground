import { BaseRequestProPertyDecorator } from './base-request-property-decorator';
import { PARAM_KEY } from './type';

export class BodyDecorator extends BaseRequestProPertyDecorator {
  override typeStr: string = 'body';
  protected readonly requestProPertyName = 'body';
  readonly type = PARAM_KEY.BODY;
  protected override readonly supperGetPropertyByArgs: boolean = true;
  override readonly isSupperPipe: boolean = true;
}
