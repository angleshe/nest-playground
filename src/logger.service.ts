export class LoggerService {
  constructor(private msg: string = '') {}
  log(...msg: string[]) {
    console.log(...msg, this.msg);
  }
}
