import { Controller, Get } from '@nestjs/common';
import { SnacksService } from './snacks.service';

@Controller('snacks')
export class SnacksController {
  constructor(private readonly snacksService: SnacksService) {}

  @Get()
  findAll(): Promise<any[]> {
    return this.snacksService.findAll();
  }
}
