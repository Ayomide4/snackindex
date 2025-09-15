import { Controller, Get, Query, Param } from '@nestjs/common';
import { MentionsService } from './mentions.service';

@Controller('mentions')
export class MentionsController {
  constructor(private readonly mentionsService: MentionsService) { }

  @Get()
  findAll(@Query('limit') limit?: string): Promise<any[]> {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.mentionsService.findAll(limitNum);
  }

  @Get('recent')
  findRecent(
    @Query('days') days?: string,
    @Query('limit') limit?: string,
  ): Promise<any[]> {
    const daysNum = days ? parseInt(days, 10) : 7;
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.mentionsService.findRecent(daysNum, limitNum);
  }

  @Get('snack/:id')
  findBySnackId(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ): Promise<any[]> {
    const snackId = parseInt(id, 10);
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.mentionsService.findBySnackId(snackId, limitNum);
  }

  @Get('source/:source')
  findBySource(
    @Param('source') source: string,
    @Query('limit') limit?: string,
  ): Promise<any[]> {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.mentionsService.findBySource(source, limitNum);
  }
}