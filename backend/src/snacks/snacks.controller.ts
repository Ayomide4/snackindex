import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { SnacksService } from './snacks.service';

@Controller('snacks')
export class SnacksController {
  constructor(private readonly snacksService: SnacksService) { }

  @Get()
  findAll(): Promise<any[]> {
    return this.snacksService.findAll();
  }

  @Get('all')
  getAllWithMetrics(): Promise<any[]> {
    return this.snacksService.getAllWithMetrics();
  }

  @Get('trending')
  getTrending(): Promise<any[]> {
    return this.snacksService.getTrending();
  }

  @Get('search')
  search(@Query('q') query: string): Promise<any[]> {
    return this.snacksService.search(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.snacksService.findOne(id);
  }

  @Get(':id/metrics')
  getMetrics(@Param('id', ParseIntPipe) id: number, @Query('days') days?: number) {
    return this.snacksService.getMetrics(id, days);
  }

  @Get(':id/detail')
  getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.snacksService.getDetail(id);
  }
}
