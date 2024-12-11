import { PipeTransform } from '../../internal';
export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    return parseInt(value);
  }
}
