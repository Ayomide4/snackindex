import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabaseClient: SupabaseClient<any, any, any, any>;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (supabaseKey && supabaseUrl) {
      this.supabaseClient = createClient(supabaseUrl, supabaseKey);
    } else {
      console.error('Supabase URL or Key not found in env');
    }
  }

  getClient(): SupabaseClient<any, any, any, any> {
    return this.supabaseClient;
  }
}
