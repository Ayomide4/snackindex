import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SnacksController } from './snacks/snacks.controller';
import { SnacksService } from './snacks/snacks.service';
import { SupabaseService } from './supabase/supabase.service';
import { ConfigModule } from '@nestjs/config';
import { MetricsController } from './metrics/metrics.controller';
import { MetricsService } from './metrics/metrics.service';
import { MentionsController } from './mentions/mentions.controller';
import { MentionsService } from './mentions/mentions.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Making it global so it can be used in any module
    }),
  ],
  controllers: [AppController, SnacksController, MetricsController, MentionsController],
  providers: [AppService, SnacksService, SupabaseService, MetricsService, MentionsService],
})
export class AppModule { }
