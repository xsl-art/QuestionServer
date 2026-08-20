import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { StatService } from './stat.service';

@Controller('stat')
export class StatController {
  constructor(private readonly statService: StatService) {}

  @Get(':questionId')
  async getPageStatistics(
    @Param('questionId') questionId: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 6,
  ) {
    if (!questionId) {
      throw new HttpException('questionId is required', HttpStatus.BAD_REQUEST);
    }
    return this.statService.getPageStatistics(questionId, +page, +pageSize);
  }

  @Get(':questionId/:componentId')
  async getChartStatistics(
    @Param('questionId') questionId: string,
    @Param('componentId') componentId: string,
  ) {
    if (!questionId || !componentId) {
      throw new HttpException(
        'questionId and componentId are required',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.statService.getChartStatistics(questionId, componentId);
  }
}
