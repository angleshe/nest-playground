import {
  Controller,
  Get,
  Next,
  Req,
  Request,
  Res,
  Response,
  Session,
  Param,
  Post,
  Body,
  Query,
  Headers,
  Ip,
  HostParam,
  HttpCode,
  Header,
  Redirect,
  Inject,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Request as NestRequest, Response as NestResponse, NextFunction } from 'express';
import { User } from './user.decorator';
import { LoggerService } from './logger.service';
import { AuthGuard } from './auth.guard';
import { Roles } from './roles.decorator';
import { LoggingInterceptor, LoggingInterceptor2 } from './logging.interceptor';

declare module 'express-session' {
  interface SessionData {
    views: number;
  }
}

@Controller()
export class AppController {
  constructor(
    private readonly logger: LoggerService,
    @Inject('CONFIG_OPTIONS') obj,
  ) {
    console.log('AppController', logger, obj);
  }

  @Get('test')
  async test() {
    return 'hello world!';
  }

  @Get('req')
  async req(@Req() req: NestRequest, num: number, @Request() request: NestRequest) {
    console.log('req====>', req);
    console.log('num====>', num);
    console.log('request====>', request);
    return 'req';
  }

  @Get('res')
  async res(@Res() res: NestResponse, @Response() response: NestRequest, num: number) {
    console.log('res====>', res);
    console.log('response====>', response);
    console.log('num====>', num);
    res.send('res');
  }

  @Get('passthroughRes')
  async passthroughRes(
    @Res({ passthrough: true }) res: NestResponse,
    @Response({ passthrough: true }) response: NestRequest,
    num: number,
  ) {
    console.log('res====>', res);
    console.log('response====>', response);
    console.log('num====>', num);
    return 'passthroughRes';
  }

  @Get('next')
  async next(@Next() next: NextFunction) {
    next();
  }

  @Get('Session')
  async session(@Session() session: NestRequest['session']) {
    session.views = (session.views ?? 0) + 1;
    return `session ${session.views}`;
  }

  @Get('id/:id')
  async param(@Param() param: { id: string }, @Param('id') id: string) {
    return `param: ${JSON.stringify(param)}, id: ${id}`;
  }

  @Post('body')
  async body(
    @Body() body: { id: number; name: string },
    @Body('name') name: string,
    @Body('id') id: number,
  ) {
    return `body: ${JSON.stringify(body)}, id: ${id}, name: ${name}`;
  }

  @Get('query')
  async query(
    @Query() query: { id: string; name: string },
    @Query('name') name: string,
    @Query('id') id: string,
  ) {
    return `query: ${JSON.stringify(query)}, id: ${id}, name: ${name}`;
  }

  @Get('headers')
  async headers(
    @Headers() headers: NestResponse['header'],
    @Headers('xx-context') context: string,
  ) {
    return `headers: ${JSON.stringify(headers)}, context: ${context}`;
  }

  @Get('ip')
  async ip(@Ip() ip: string) {
    return `ip: ${ip}`;
  }

  @Get('hostParam')
  async hostParam(@HostParam() host: NestRequest['host']) {
    return `host: ${host}`;
  }

  @Get('httpCode')
  @HttpCode(204)
  async httpCode() {
    return 'httpCode';
  }

  @Get('header')
  @Header('Cache-Control', 'none')
  @Header('xx-cx', 'test')
  async header() {
    return 'header';
  }

  @Get('redirect')
  @Redirect('https://nestjs.com', 301)
  async redirect() {}

  @Get('docs')
  @Redirect('https://docs.nestjs.com', 302)
  getDocs(@Query('version') version) {
    if (version && version === '5') {
      return { url: 'https://docs.nestjs.com/v5/' };
    }
  }

  @Get('user')
  user(@User() user: NestRequest['user'], @User('name') name: string) {
    return `user: ${JSON.stringify(user)}, name: ${name}`;
  }

  @Get('role/:role')
  @UseGuards(AuthGuard)
  @Roles(['user'])
  @UseInterceptors(LoggingInterceptor2)
  @UseInterceptors(LoggingInterceptor)
  role(@Param('role') role: string) {
    return `role: ${role}`;
  }
}
