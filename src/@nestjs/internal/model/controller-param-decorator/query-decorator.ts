import { BaseRequestProPertyDecorator } from './base-request-property-decorator';
import { PARAM_KEY } from './type';

export class QueryDecorator extends BaseRequestProPertyDecorator {
  override typeStr: string = 'query';
  protected readonly requestProPertyName = 'query';
  readonly type = PARAM_KEY.QUERY;
  protected override readonly supperGetPropertyByArgs: boolean = true;
  override readonly isSupperPipe: boolean = true;
}
