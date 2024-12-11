import { ExceptionResponse } from './type';

export class HttpException {
  private readonly response: ExceptionResponse;
  private readonly status: number;

  constructor(response: ExceptionResponse, status: number) {
    this.response = response;
    this.status = status;
  }

  getResponse() {
    return this.response;
  }

  getStatus() {
    return this.status;
  }
}
