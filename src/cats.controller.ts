import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Post,
  Param,
} from '@nestjs/common';
import { Cat, CatsService } from './cats.service';
import { LoggerService } from './logger.service';

class ForbiddenException extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}

@Controller('cats')
export class CatsController {
  constructor(
    private readonly catsService: CatsService,
    private readonly logger: LoggerService,
  ) {
    console.log('CatsController ====>', this.catsService, this.logger);
  }

  @Post()
  async create(@Body() createCatDto: Cat) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll() {
    return this.catsService.findAll();
  }

  @Get('value/:id')
  async getValue(@Param('id', ParseIntPipe) id: number) {
    this.logger.log('xxxxx=====>', typeof id, id.toString());
    return `this.value: gg`;
  }

  @Get('error')
  async error() {
    throw new ForbiddenException();
  }
}
