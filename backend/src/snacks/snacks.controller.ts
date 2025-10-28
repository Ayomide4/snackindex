import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SnacksService } from './snacks.service';

@Controller('snacks')
export class SnacksController {
  constructor(private readonly snacksService: SnacksService) { }

  @Get()
  findAll(): Promise<any[]> {
    return this.snacksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.snacksService.findOne(id)
  }
  // findOne(@Param('id', ParseIntPipe) id: number)): Promise<any> {
  //   return this.snacksService.findOne(id)
  // }
}
