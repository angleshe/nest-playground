import clc from 'cli-color';
export class Logger {
  private static lastLogTime: number  = -1;

  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  static log(msg: string, context: string) {
    const timestamp = new Date().toLocaleString();
    const currentTime = Date.now();
    const diffTime =  currentTime -  Logger.lastLogTime;
    const pid = process.pid;
    console.log(`${clc.green(`[Nest] ${pid} -`)} ${timestamp}   ${clc.green('LOG')} ${clc.yellow(`[${context}]`)} ${clc.green(msg)}${Logger.lastLogTime < 0 ? '': clc.yellow(` +${diffTime}ms`)}`);
    Logger.lastLogTime = currentTime;
  }

  log(msg: string, context: string = this.context) {
    return Logger.log(msg, context);
  }
}